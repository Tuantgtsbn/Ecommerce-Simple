import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import AppProvider from "./contexts/AppContext";
import {BrowserRouter as Router} from "react-router-dom";
import {Suspense} from "react";
import Loading from "@components/common/Loading/Loading";
import {Provider} from "react-redux";
import store from "./store/store";
import ScrollToTop from "./components/common/ScrollToTop";
createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <AppProvider>
      <Router>
        <ScrollToTop />
        <Suspense fallback={<Loading className="h-screen" />}>
          <App />
        </Suspense>
      </Router>
    </AppProvider>
  </Provider>,
);
