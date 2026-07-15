import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Avatar } from "../shared/components/ui/Avatar";
import { MessageSkeleton } from "../shared/components/ui/Skeleton";
import { Spinner } from "../shared/components/ui/Spinner";
import { Button } from "../shared/components/ui/Button";
import { ArrowLeftIcon, InfoIcon } from "../shared/components/icons/Icons";
import { IconButton } from "../shared/components/ui/IconButton";
import { MessageBubble } from "../features/message/components/MessageBubble";
import { MessageInput } from "../features/message/components/MessageInput";
import { GroupInfoModal } from "../features/message/components/GroupInfoModal";
import { useChat } from "../features/message/hooks/useChat";
import { useConversations } from "../features/message/hooks/useConversations";
import { useAuth } from "../features/auth/hooks/useAuth";
import { useToast } from "../shared/components/ui/Toast";
import type { ChatMessage } from "../features/message/types/message.types";
import {
  uploadAttachments,
  type PendingAttachment,
} from "../features/message/utils/attachment";
import type { PostAuthor } from "../features/post/types/post.types";
import { useConversationDetail } from "@/features/message/hooks/useConversationDetail";
import { useUserById } from "@/features/user/hook/useUserById";
import { conversationService } from "../features/message/service/conversationService";
import { useTranslation } from "react-i18next";

export const ChatPage = () => {
  const { t } = useTranslation();
  const { conversationId: routeConversationId } = useParams<{
    conversationId: string;
  }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { setActiveConversation, refetch: refetchConversations } =
    useConversations();

  const isNewRoute = !routeConversationId;
  const recipientId = isNewRoute
    ? (searchParams.get("userId") ?? undefined)
    : undefined;

  // "/messages/new?userId=X" có thể trỏ tới 1 user ĐÃ từng nhắn tin —
  // trước khi coi đây là "chat mới trống", check BE xem đã có conversation
  // PRIVATE với user đó chưa. Có thì lấy luôn lịch sử thật, chưa thì mới
  // hiện màn hình chat rỗng để gửi tin đầu tiên.
  const [isCheckingExisting, setIsCheckingExisting] = useState(isNewRoute);
  const [resolvedConversationId, setResolvedConversationId] = useState<
    string | undefined
  >(routeConversationId);

  useEffect(() => {
    if (!isNewRoute) {
      setResolvedConversationId(routeConversationId);
      setIsCheckingExisting(false);
      return;
    }
    if (!recipientId) {
      setIsCheckingExisting(false);
      return;
    }

    let cancelled = false;
    setIsCheckingExisting(true);
    conversationService
      .checkPrivateConversationExists(recipientId)
      .then((existingId) => {
        if (cancelled) return;
        if (existingId) {
          // Đã từng nhắn tin — chuyển sang route lịch sử thật để useChat/useConversationDetail
          // load đúng luồng cũ (poll history + realtime), không phải mode "chat mới".
          navigate(`/messages/${existingId}`, { replace: true });
        } else {
          setIsCheckingExisting(false);
        }
      })
      .catch(() => {
        // Không xác định được thì cứ coi như chưa có, để người dùng vẫn gửi
        // được tin nhắn đầu tiên bình thường (BE sẽ tự xử lý nếu có xung đột).
        if (!cancelled) setIsCheckingExisting(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isNewRoute, recipientId, routeConversationId, navigate]);

  // Còn "chat mới thật sự" chỉ khi: đang ở route /messages/new VÀ đã check
  // xong VÀ xác nhận chưa có conversation nào (nếu có, effect trên đã điều
  // hướng đi rồi nên nhánh này sẽ không kịp render).
  const isNewChat = isNewRoute && !isCheckingExisting;
  const conversationId = isNewRoute ? undefined : resolvedConversationId;

  // Báo cho toàn app biết conversation nào đang được xem trực tiếp — realtime
  // (useConversationsRealtime) dựa vào đây để KHÔNG tăng unreadCount khi tin
  // nhắn mới tới đúng lúc mình đang mở sẵn cuộc trò chuyện đó.
  useEffect(() => {
    setActiveConversation(conversationId ?? null);
    return () => {
      setActiveConversation(null);
    };
  }, [conversationId, setActiveConversation]);

  const { profile: targetUser, isLoading: isTargetLoading } =
    useUserById(recipientId);

  const {
    detail,
    isLoading: isDetailLoading,
    refetch: refetchDetail,
  } = useConversationDetail(conversationId);
  const {
    messages,
    isLoading,
    isSending,
    hasNext,
    loadMore,
    sendMessage,
    recallMessage,
  } = useChat({
    conversationId,
    recipientId: isNewChat ? recipientId : undefined,
  });

  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLoadingMoreRef = useRef(false);

  const peerMember =
    !isNewChat && detail?.type === "PRIVATE"
      ? detail.members.content.find((m) => m.userId !== user?.id)
      : undefined;

  // Chỉ auto-scroll xuống cuối khi tin nhắn CUỐI CÙNG thay đổi (gửi/nhận tin
  // mới) — khi loadMore() nối thêm tin CŨ lên ĐẦU danh sách, tin cuối cùng
  // vẫn giữ nguyên nên sẽ KHÔNG bị giật xuống dưới mất vị trí đang đọc.
  const lastMessageIdRef = useRef<string | null>(null);
  useEffect(() => {
    const last = messages[messages.length - 1];
    const isNewAtBottom = !!last && last.id !== lastMessageIdRef.current;
    const wasEmpty = lastMessageIdRef.current === null;
    lastMessageIdRef.current = last?.id ?? null;
    if (!isNewAtBottom) return;
    bottomRef.current?.scrollIntoView({
      behavior: wasEmpty ? "auto" : "smooth",
    });
  }, [messages.length]);

  // Infinite scroll: cuộn gần lên đầu khung chat -> tải thêm tin nhắn cũ hơn.
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || !hasNext || isLoadingMoreRef.current) return;
    if (el.scrollTop < 80) {
      isLoadingMoreRef.current = true;
      setIsLoadingMore(true);
      const prevHeight = el.scrollHeight;
      loadMore().finally(() => {
        isLoadingMoreRef.current = false;
        setIsLoadingMore(false);
        // Giữ nguyên vị trí đọc — bù lại phần chiều cao vừa được chèn thêm ở đầu.
        requestAnimationFrame(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop =
              scrollRef.current.scrollHeight - prevHeight;
          }
        });
      });
    }
  };

  const handleAccept = async () => {
    if (!conversationId || !user?.id) return;
    setIsAccepting(true);
    try {
      await conversationService.acceptConversation({
        conversationId,
        userAccept: user.id,
      });
      await refetchDetail();
      await refetchConversations();
      showToast(t("accept_conversation_success"));
    } catch (e) {
      showToast(
        e instanceof Error ? e.message : t("accept_conversation_error"),
        "error",
      );
    } finally {
      setIsAccepting(false);
    }
  };

  const handleSend = async (text: string, media?: PendingAttachment[]) => {
    const mediaRequests = media?.length
      ? await uploadAttachments(media)
      : undefined;
    const sent = await sendMessage(text, mediaRequests, replyingTo?.id);
    setReplyingTo(null);

    if (isNewChat && sent?.conversationId) {
      // Conversation này chưa từng tồn tại trong Redux (ConversationList lấy
      // dữ liệu qua GET /v1/conversations, không tự suy ra được từ response
      // gửi tin) — phải refetch để sidebar hiện ngay, không phải đợi F5.
      await refetchConversations();
      navigate(`/messages/${sent.conversationId}`, { replace: true });
    }
  };

  const headerLoading = isNewChat ? isTargetLoading : isDetailLoading;
  const headerName = isNewChat ? targetUser?.fullName : detail?.displayName;
  const headerAvatar = isNewChat
    ? targetUser?.avatarUrl
    : detail?.displayAvatarUrl;
  const headerUsername = isNewChat
    ? targetUser?.username
    : peerMember?.username;
  const showHeader = isNewChat ? !!targetUser : !isDetailLoading && !!detail;
  const isGroup = !isNewChat && detail?.type === "GROUP";
  // myStatus PENDING (và không phải chat mới) nghĩa là NGƯỜI KHÁC đã gửi tin
  // đầu tiên cho mình, đang chờ mình chấp nhận (xem PendingMessageNotificationEvent).
  const isPendingForMe =
    !isNewChat && detail?.type === "PRIVATE" && detail?.myStatus === "PENDING";

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button
          onClick={() => navigate("/messages")}
          className="cursor-pointer rounded-full p-1.5 hover:bg-surface-hover md:hidden">
          <ArrowLeftIcon size={20} />
        </button>
        {!headerLoading && showHeader && (
          <button
            onClick={() =>
              !isGroup &&
              headerUsername &&
              navigate(`/profile/${headerUsername}`)
            }
            disabled={isGroup ? false : !headerUsername}
            className="flex flex-1 cursor-pointer items-center gap-3 text-left disabled:cursor-default">
            <Avatar
              src={headerAvatar}
              name={headerName ?? "Thịnh đep trai"}
              size="sm"
            />
            <div>
              <p className="font-semibold text-text">{headerName}</p>
              {headerUsername && (
                <p className="text-xs text-secondary">@{headerUsername}</p>
              )}
              {isGroup && (
                <p className="text-xs text-secondary">
                  {t("group_members_count", {
                    count: detail?.members.content.length ?? 0,
                  })}
                </p>
              )}
            </div>
          </button>
        )}
        {isGroup && (
          <IconButton
            icon={<InfoIcon size={20} />}
            onClick={() => setShowGroupInfo(true)}
            className="text-secondary hover:bg-surface-hover hover:text-text"
          />
        )}
      </div>

      {isPendingForMe && (
        <div className="flex items-center justify-between gap-3 border-b border-border bg-surface/60 px-4 py-2.5">
          <p className="text-sm text-secondary">
            {t("pending_conversation_hint")}
          </p>
          <Button size="sm" onClick={handleAccept} loading={isAccepting}>
            {t("accept_conversation_action")}
          </Button>
        </div>
      )}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4">
        {isCheckingExisting || (!isNewChat && isLoading) ? (
          // isCheckingExisting: đang xác định user này đã có conversation
          // chưa (route /messages/new). !isNewChat && isLoading: đang tải
          // lịch sử của 1 conversation đã tồn tại. Cả 2 đều là "đang tải".
          <div className="flex flex-col gap-3">
            <MessageSkeleton align="left" />
            <MessageSkeleton align="right" />
            <MessageSkeleton align="left" />
            <MessageSkeleton align="left" />
            <MessageSkeleton align="right" />
          </div>
        ) : (
          // Chat mới (chưa từng nhắn tin): messages rỗng nên chỉ render
          // <div ref={bottomRef} /> — khung chat trông giống hệt 1 cuộc trò
          // chuyện bình thường, người dùng gõ và gửi ngay tin đầu tiên.

          <div className="flex flex-col gap-2">
            {isLoadingMore && (
              <div className="flex justify-center py-2">
                <Spinner size={4} />
              </div>
            )}
            {messages.map((m) => {
              const participant: PostAuthor = {
                id: m.senderId,
                username: m.senderUsername,
                fullName: m.senderUsername,
                avatarUrl: m.senderAvatarUrl,
              } as PostAuthor;

              return (
                <MessageBubble
                  key={m.id}
                  message={m}
                  participant={participant}
                  onReply={setReplyingTo}
                  onRecall={recallMessage}
                />
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <MessageInput
        onSend={handleSend}
        disabled={isSending || isCheckingExisting}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />

      {isGroup && detail && user?.id && (
        <GroupInfoModal
          isOpen={showGroupInfo}
          onClose={() => setShowGroupInfo(false)}
          conversationId={conversationId!}
          detail={detail}
          currentUserId={user.id}
          onChanged={() => {
            refetchDetail();
            refetchConversations();
          }}
          onLeft={() => {
            refetchConversations();
            navigate("/messages", { replace: true });
          }}
        />
      )}
    </div>
  );
};
