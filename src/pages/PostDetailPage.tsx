import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon } from "../shared/components/icons/Icons";
import { PostCard } from "../features/post/components/PostCard";
import { PostSkeleton } from "../shared/components/ui/Skeleton";
import { ErrorState } from "../shared/components/ui/ErrorState";
import { CommentForm } from "../features/reply/replies/CommentForm";
import { CommentList } from "../features/reply/replies/CommentList";
import { usePostDetail } from "../features/post/hooks/usePostDetail";
import { useComments } from "../features/reply/hooks/useComments";
import { useLanguage } from "../contexts/LanguageContext";

export const PostDetailPage = () => {
  const { t } = useLanguage();
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const {
    post,
    isLoading,
    error,
    toggleLike,
    toggleBookmark,
    toggleRepost,
    refetch,
  } = usePostDetail(postId);
  const {
    comments,
    isLoading: commentsLoading,
    addComment,
    toggleLike: toggleCommentLike,
  } = useComments(postId);

  return (
    <div className="animate-fade-in">
      <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-surface/85 px-4 py-3 backdrop-blur-md">
        <button
          onClick={() => navigate(-1)}
          className="cursor-pointer rounded-full p-1.5 hover:bg-surface-hover"
        >
          <ArrowLeftIcon size={20} />
        </button>
        <h1 className="text-lg font-bold text-text">{t("connect_title")}</h1>
      </div>

      {isLoading && <PostSkeleton />}
      {error && <ErrorState message={t("post_not_found")} onRetry={refetch} />}
      {post && (
        <PostCard
          post={{
            ...post,
            isLiked: post.isLiked,
            isBookmarked: post.isBookmarked,
            isReposted: post.isReposted,
          }}
          onLike={toggleLike}
          onRepost={toggleRepost}
          onBookmark={toggleBookmark}
          clickable={false}
        />
      )}

      <CommentForm onSubmit={addComment} />
      <CommentList
        comments={comments}
        isLoading={commentsLoading}
        onLike={toggleCommentLike}
      />
    </div>
  );
};
