import { useSelector } from 'react-redux';
import { selectAuth, selectCurrentUser } from '../store/authSlice';


export const useAuth = () => {
  const { isAuthenticated, role, email, fullName } = useSelector(selectAuth);
  const user = useSelector(selectCurrentUser);
  return { isAuthenticated, role, email, fullName, user };
};
