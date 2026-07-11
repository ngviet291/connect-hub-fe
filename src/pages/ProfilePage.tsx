import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import type { UserProfile } from "../features/user/types/user.types";
import { Avatar } from "../shared/components/ui/Avatar";
import { Button } from "../shared/components/ui/Button";
import { Dropdown } from "../shared/components/ui/Dropdown";
import {
  ProfileHeaderSkeleton,
  PostSkeleton,
} from "../shared/components/ui/Skeleton";
import { ErrorState } from "../shared/components/ui/ErrorState";
import { EmptyState } from "../shared/components/ui/EmptyState";
import {
  SearchIcon,
  MoreHorizontalIcon,
  LogoIcon,
  MenuIcon,
  ArrowLeftIcon,
  ShareIcon,
  BarChartIcon,
  CreateConnectIcon,
  FollowSuggestIcon,
} from "../shared/components/icons/Icons";
import { MOCK_CONVERSATIONS, MOCK_USERS } from "../mocks/mockData";
import { useAuth } from "../features/auth/hooks/useAuth";
import { useUserPosts } from "../features/post/hooks/useUserPosts";
import { PostCard } from "../features/post/components/PostCard";
import { EditProfileModal } from "../features/user/components/EditProfileModal";
import { CreatePostModal } from "../features/post/components/CreatePostModal";
import { userService } from "@/features/user/service/userService";
import { useToast } from "@/shared/components/ui/Toast";
import { followService } from "@/features/follow";

/* ─── tabs & completion cards: định nghĩa bên trong component để dùng được t() ─── */

/* ═══════════════════════════════════════════════════════════ */
export const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { user: me } = useAuth();
  const { t } = useTranslation();

  const PROFILE_TABS = [
    { key: "posts", label: t("profile_tab_posts") },
    { key: "replies", label: t("profile_tab_replies") },
    { key: "media", label: t("profile_tab_media") },
    { key: "reposts", label: t("profile_tab_reposts") },
  ];

  const COMPLETION_CARDS = [
    {
      key: "create",
      icon: <CreateConnectIcon size={32} />,
      title: t("profile_completion_create_title"),
      desc: t("profile_completion_create_desc"),
      cta: t("profile_completion_create_cta"),
      action: "compose",
    },
    {
      key: "follow",
      icon: <FollowSuggestIcon size={32} />,
      title: t("profile_completion_follow_title"),
      desc: t("profile_completion_follow_desc"),
      cta: t("profile_completion_follow_cta"),
      action: "search",
    },
  ];

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const tabsRef = useRef<HTMLDivElement>(null);
  const [tabsOverflow, setTabsOverflow] = useState({
    left: false,
    right: false,
  });

  const checkTabsOverflow = () => {
    const el = tabsRef.current;
    if (!el) return;
    setTabsOverflow({
      left: el.scrollLeft > 4,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    });
  };

  useEffect(() => {
    checkTabsOverflow();
    window.addEventListener("resize", checkTabsOverflow);
    return () => window.removeEventListener("resize", checkTabsOverflow);
  }, []);

  const {
    posts,
    isLoading: postsLoading,
    toggleLike,
    toggleRepost,
    toggleBookmark,
    removePost,
  } = useUserPosts(username);

  const fetchProfile = async () => {
    if (!username) return;
    setIsLoading(true);
    setLoadError(false);
    try {
      setProfile(null);
      const user = await userService.getUserByUsername(username);
      setProfile(user);

      const stats = await followService.getStats(user.id);
      setProfile((prev) => (prev ? { ...prev, ...stats } : null));
    } catch (error) {
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username]);
  useEffect(() => setActiveTab("posts"), [username]);

  if (isLoading) return <ProfileHeaderSkeleton />;
  if (loadError || !profile)
    return <ErrorState message={t("user_not_found")} onRetry={fetchProfile} />;

  const isMe = me?.username === username;

  const handleMessage = () => {
    const conversation = MOCK_CONVERSATIONS.find(
      (c) => c.participant.username === profile.username,
    );
    navigate(conversation ? `/messages/${conversation.id}` : "/messages");
  };

  const handleCopyProfileLink = () => {
    const url = `${window.location.origin}/profile/${profile.username}`;
    navigator.clipboard.writeText(url);
  };

  const toggleFollow = async () => {
    const wasFollowing = profile.isFollowing;
    try {
      wasFollowing
        ? await followService.unfollow(profile.id)
        : await followService.follow(profile.id);
      setProfile((p) =>
        p
          ? {
              ...p,
              isFollowing: !wasFollowing,
              followersCount: p.followersCount + (wasFollowing ? -1 : 1),
            }
          : p,
      );
    } catch (error) {
      showToast(
        wasFollowing ? t("error_unfollow_user") : t("error_follow_user"),
        "error",
      );
    }
  };

  /* completion cards left = 4 (mock) */
  const completionLeft = 4;

  return (
    <div className="animate-fade-in min-h-screen bg-background md:min-h-full md:bg-surface">
      {/* ── Sticky top bar ─────────────────────────────── */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-background/90 md:bg-surface/90 backdrop-blur-md md:rounded-t-2xl">
        {/* Left: hamburger menu (mobile only) / back button (desktop only) */}
        <div className="md:hidden">
          <Dropdown
            align="left"
            menuClassName="rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
            trigger={
              <button className="cursor-pointer rounded-full p-1.5 text-text hover:bg-surface-hover">
                <MenuIcon size={22} />
              </button>
            }
            items={
              isMe
                ? [
                    {
                      label: t("nav_settings"),
                      onClick: () => navigate("/settings"),
                    },
                    {
                      label: t("nav_logout"),
                      danger: true,
                      onClick: () => navigate("/login"),
                    },
                  ]
                : [
                    { label: t("block_user"), onClick: () => {} },
                    { label: t("report"), danger: true, onClick: () => {} },
                  ]
            }
          />
        </div>
        <button
          onClick={() => navigate(-1)}
          className="hidden cursor-pointer rounded-full p-1.5 text-text hover:bg-surface-hover md:flex">
          <ArrowLeftIcon size={22} />
        </button>

        {/* Center: logo */}
        <NavLink to="/" className="flex items-center">
          <LogoIcon size={28} />
        </NavLink>

        {/* Right: search */}
        <button
          onClick={() => navigate("/search")}
          className="cursor-pointer rounded-full p-1.5 text-text hover:bg-surface-hover">
          <SearchIcon size={22} />
        </button>
      </div>

      {/* ── Profile block ───────────────────────────────── */}
      <div className="px-4 pt-4 pb-3">
        {/* Name + avatar row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-[22px] font-bold text-text leading-tight">
              {profile.fullName}
            </h1>
            <p className="text-[15px] text-text">
              {profile.username}
              {profile.isVerified && (
                <span className="ml-1 text-primary">✓</span>
              )}
            </p>
          </div>
          <Avatar src={profile.avatarUrl} name={profile.fullName} size="xl" />
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-3 text-[14px] text-text leading-snug whitespace-pre-wrap">
            {profile.bio}
          </p>
        )}

        {/* Followers row */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-4">
            <button
              onClick={() =>
                navigate(`/profile/${username}/followers/${profile.id}`)
              }
              className="cursor-pointer text-[14px] text-secondary hover:underline">
              <span className="font-semibold text-text">
                {profile.followersCount ?? 0}
              </span>{" "}
              {t("followers_label")}
            </button>
            <button
              onClick={() =>
                navigate(`/profile/${username}/following/${profile.id}`)
              }
              className="cursor-pointer text-[14px] text-secondary hover:underline">
              <span className="font-semibold text-text">
                {profile.followingCount ?? 0}
              </span>{" "}
              {t("following")}
            </button>
          </div>
          <button
            onClick={() =>
              navigate(`/profile/${username}/following/${profile.id}`)
            }
            className="cursor-pointer rounded-lg p-1.5 text-secondary hover:bg-surface-hover hover:text-text"
            title={t("profile_stats_tooltip")}>
            <BarChartIcon size={20} />
          </button>
        </div>

        {/* Action button */}
        <div className="mt-3">
          {isMe ? (
            <Button
              variant="outline"
              className="w-full rounded-xl font-semibold"
              onClick={() => setEditOpen(true)}>
              {t("edit_profile_button")}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant={profile.isFollowing ? "outline" : "primary"}
                className="flex-1 rounded-xl font-semibold"
                onClick={toggleFollow}>
                {profile.isFollowing ? t("following") : t("follow")}
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-xl font-semibold"
                onClick={handleMessage}>
                {t("message_button")}
              </Button>
              <Dropdown
                align="right"
                trigger={
                  <button className="cursor-pointer rounded-xl border border-border px-3 py-2 text-secondary hover:bg-surface-hover">
                    <MoreHorizontalIcon size={18} />
                  </button>
                }
                items={[
                  {
                    label: t("copy_profile_link"),
                    icon: <ShareIcon size={16} />,
                    onClick: handleCopyProfileLink,
                  },
                  { label: t("block_user"), danger: true, onClick: () => {} },
                  { label: t("report"), danger: true, onClick: () => {} },
                ]}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs (horizontally scrollable, with overflow hints) ── */}
      <div className="relative border-b border-border">
        <div
          ref={tabsRef}
          onScroll={checkTabsOverflow}
          className="flex overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: "none" }}>
          {PROFILE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex-1 min-w-fit cursor-pointer px-4 py-3.5 text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? "text-text"
                  : "text-secondary hover:text-text"
              }`}>
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute inset-x-0 bottom-0 h-[2px] bg-text" />
              )}
            </button>
          ))}
        </div>
        {tabsOverflow.left && (
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent md:from-surface" />
        )}
        {tabsOverflow.right && (
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent md:from-surface" />
        )}
      </div>

      {/* ── Quick compose bar (only on own profile, posts tab) ── */}
      {isMe && activeTab === "posts" && (
        <div
          className="flex items-center gap-3 px-4 py-3 border-b border-border cursor-pointer"
          onClick={() => setComposeOpen(true)}>
          <Avatar src={me?.avatarUrl} name={me?.fullName ?? ""} size="sm" />
          <span className="flex-1 text-sm text-secondary select-none">
            {t("profile_whats_new")}
          </span>
          <button
            className="cursor-pointer rounded-xl bg-text px-4 py-1.5 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              setComposeOpen(true);
            }}>
            {t("post_button")}
          </button>
        </div>
      )}

      {/* ── Tab content ─────────────────────────────────── */}
      {activeTab === "posts" && (
        <>
          {/* Profile completion cards (own profile, no posts yet) */}
          {isMe && posts.length === 0 && !postsLoading && (
            <div className="px-4 py-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[13px] font-semibold text-text">
                  {t("profile_completion_title")}
                </span>
                <span className="text-[13px] font-semibold text-text">
                  {t("profile_completion_remaining", { count: completionLeft })}
                </span>
              </div>
              <div
                className="flex gap-3 overflow-x-auto pb-1"
                style={{ scrollbarWidth: "none" }}>
                {COMPLETION_CARDS.map((card) => (
                  <div
                    key={card.key}
                    className="shrink-0 w-44 rounded-2xl border border-border bg-surface p-4 flex flex-col gap-3">
                    <span className="text-secondary">{card.icon}</span>
                    <div>
                      <p className="text-[13px] font-semibold text-text leading-snug">
                        {card.title}
                      </p>
                      <p className="mt-1 text-[12px] text-secondary leading-snug line-clamp-3">
                        {card.desc}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        card.action === "compose"
                          ? setComposeOpen(true)
                          : navigate("/search")
                      }
                      className="w-full cursor-pointer rounded-xl bg-text py-2 text-[13px] font-bold text-background hover:opacity-90 transition-opacity">
                      {card.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Post list */}
          {postsLoading &&
            Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)}
          {!postsLoading &&
            posts.length > 0 &&
            posts.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                onLike={toggleLike}
                onRepost={toggleRepost}
                onBookmark={toggleBookmark}
                onDelete={removePost}
              />
            ))}
          {!postsLoading && posts.length === 0 && isMe && (
            <div className="py-8" /> /* space below cards */
          )}
          {!postsLoading && posts.length === 0 && !isMe && (
            <EmptyState
              title={t("no_posts_title")}
              description={t("no_posts_desc_other")}
            />
          )}
        </>
      )}

      {activeTab === "replies" && (
        <EmptyState
          title={t("replies_empty_title")}
          description={t("replies_empty_desc")}
        />
      )}
      {activeTab === "media" && (
        <EmptyState
          title={t("media_empty_title")}
          description={t("media_empty_desc")}
        />
      )}
      {activeTab === "reposts" && (
        <EmptyState
          title={t("reposts_empty_title")}
          description={t("reposts_empty_desc")}
        />
      )}

      {/* ── Footer (own profile) ─────────────────────────── */}
      {isMe && (
        <footer className="mt-8 pb-28 text-center">
          <p className="text-[11px] text-secondary leading-relaxed">
            © {new Date().getFullYear()}{" "}
            <span className="text-primary cursor-pointer hover:underline">
              {t("footer_terms")}
            </span>
            {"  "}
            <span className="text-secondary cursor-pointer hover:underline">
              {t("footer_privacy")}
            </span>
            <br />
            <span className="text-secondary cursor-pointer hover:underline">
              {t("footer_cookies")}
            </span>
          </p>
        </footer>
      )}

      {/* ── Modals ───────────────────────────────────────── */}
      {isMe && (
        <EditProfileModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          profile={profile}
          onSaved={(updated) => setProfile(updated)}
        />
      )}
      <CreatePostModal
        isOpen={composeOpen}
        onClose={() => setComposeOpen(false)}
        onCreated={() => navigate("/")}
      />
    </div>
  );
};
