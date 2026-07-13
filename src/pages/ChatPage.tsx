import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Avatar } from "../shared/components/ui/Avatar";
import { MessageSkeleton } from "../shared/components/ui/Skeleton";
import { ArrowLeftIcon } from "../shared/components/icons/Icons";
import { MessageBubble } from "../features/message/components/MessageBubble";
import { MessageInput } from "../features/message/components/MessageInput";
import { useChat } from "../features/message/hooks/useChat";
import { useAuth } from "../features/auth/hooks/useAuth";
import type { ChatMessage } from "../features/message/types/message.types";
import type { PendingAttachment } from "../features/message/utils/attachment";
import type { PostAuthor } from "../features/post/types/post.types";
import { useConversationDetail } from "@/features/message/hooks/useConversationDetail";
import { useUserById } from "@/features/user/hook/useUserById";
import { conversationService } from "../features/message/service/conversationService";

export const ChatPage = () => {
  const { conversationId: routeConversationId } = useParams<{
    conversationId: string;
  }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

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

  const { profile: targetUser, isLoading: isTargetLoading } =
    useUserById(recipientId);

  const { detail, isLoading: isDetailLoading } =
    useConversationDetail(conversationId);
  const { messages, isLoading, isSending, sendMessage, recallMessage } =
    useChat({
      conversationId,
      recipientId: isNewChat ? recipientId : undefined,
    });

  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const peerMember =
    !isNewChat && detail?.type === "PRIVATE"
      ? detail.members.content.find((m) => m.userId !== user?.id)
      : undefined;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async (text: string, media?: PendingAttachment[]) => {
    if (media?.length) {
      console.warn(
        "[ChatPage] Media upload chưa được wire — bỏ qua",
        media.length,
        "file(s)",
      );
    }

    const sent = await sendMessage(text, undefined, replyingTo?.id);
    setReplyingTo(null);

    if (isNewChat && sent?.conversationId) {
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
              headerUsername && navigate(`/profile/${headerUsername}`)
            }
            disabled={!headerUsername}
            className="flex cursor-pointer items-center gap-3 text-left disabled:cursor-default">
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
            </div>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
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
    </div>
  );
};
