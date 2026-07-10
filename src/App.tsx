import { Provider } from "react-redux";
import { store } from "./app/store";
import { ToastContainer } from "./shared/components/ui/Toast";
import { AppRouter } from "./app/router";

const App = () => (
  <Provider store={store}>
    <AppRouter />
    <ToastContainer />
  </Provider>
);

export default App;
