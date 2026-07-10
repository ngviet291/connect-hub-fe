import { Provider } from "react-redux";
import { store } from "./app/store";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./features/auth/store/AuthContext";
import { ConversationProvider } from "./features/message/store/ConversationContext";
import { ToastProvider } from "./shared/components/ui/Toast";
import { AppRouter } from "./app/router";

const App = () => (
  <Provider store={store}>
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <ConversationProvider>
            <AppRouter />
          </ConversationProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  </Provider>
);

export default App;
