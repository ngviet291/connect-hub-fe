import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './features/auth/store/AuthContext';
import { NotificationProvider } from './features/notification/store/NotificationContext';
import { ConversationProvider } from './features/message/store/ConversationContext';
import { ToastProvider } from './shared/components/ui/Toast';
import { AppRouter } from './app/router';

const App = () => (
  <ThemeProvider>
    <LanguageProvider>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <ConversationProvider>
              <AppRouter />
            </ConversationProvider>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </LanguageProvider>
  </ThemeProvider>
);

export default App;
