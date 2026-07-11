import { Provider } from "react-redux";
import { store } from "./app/store";
import { AppRouter } from "./app/router";
import { ToastContainer } from "./shared/components/ui/Toast";

const App = () => (
  <Provider store={store}>
    <AppRouter />
    <ToastContainer />
  </Provider>
);

export default App;
