import { configureStore } from "@reduxjs/toolkit";
import categoryReducer from "./catagorySlice";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";

const persistConfig = {
  key: "root",
  storage,
};
const persistedReducer = persistReducer(persistConfig, categoryReducer);
const appStore = configureStore({
  reducer: persistedReducer,
});
export default appStore;
const persistor = persistStore(appStore);
export { appStore, persistor };
