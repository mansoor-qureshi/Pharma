import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter } from "react-router-dom";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { RouteMatchProvider } from "./context/RouteMatchContext.jsx";
import { SearchProvider } from "./context/SearchContext.jsx";
import {appStore, persistor} from "./redux/appStore.jsx";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <AuthProvider>
      <RouteMatchProvider>
        <SearchProvider>
          <BrowserRouter>
            <SkeletonTheme baseColor="#ebebeb " highlightColor="#f5f5f5">
              <Provider store={appStore}>
                <PersistGate persistor={persistor}>
                  <App />
                </PersistGate>
              </Provider>
            </SkeletonTheme>
          </BrowserRouter>
        </SearchProvider>
      </RouteMatchProvider>
    </AuthProvider>

    <ToastContainer
      position="bottom-left"
      autoClose={1000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
  </>
);
