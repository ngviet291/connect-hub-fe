
// src/features/auth/store/useAuth.ts
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../../app/store";
import type { AuthUser } from "../types/auth.types";
import type { UserRole } from "../../user/types/user.types";
import {
  selectCurrentUser,
  selectIsAuth,
  selectRole,
  selectAuth,
  setTokens,
  setUser,
  setCurrentUser,
  logout as logoutAction,
} from "../store/authSlice";

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();

  const auth = useSelector(selectAuth);
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuth);
  const role = useSelector(selectRole);

  return {
    // giữ nguyên các field cũ để chỗ khác dùng .accessToken, .email... không phải sửa
    ...auth,
    user,
    isAuthenticated,
    role,

    setTokens: (accessToken: string, refreshToken: string) =>
      dispatch(setTokens({ accessToken, refreshToken })),

    setUser: (email: string, userRole: UserRole, fullName: string) =>
      dispatch(setUser({ email, role: userRole, fullName })),

    setCurrentUser: (u: AuthUser) => dispatch(setCurrentUser(u)),

    logout: () => dispatch(logoutAction()),
  };
}
