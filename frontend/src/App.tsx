import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Pv from "./features/chat/components/Pv";
import { fetchUserById } from "./features/authentication/authSlice";
import Notification from "./components/Notification";
import i18n from "./i18n";
import { AppDispatch, RootState } from "./redux/store";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const { lang } = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    const fetchData = async () => {
      await dispatch(fetchUserById());
      document.dir = i18n.dir();
      i18n.on("languageChanged", () => {
        document.dir = i18n.dir();
      });
    };
    fetchData();
  }, [lang]);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Dashboard />}>
          <Route path="pv/:id" element={<Pv />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Notification />
      <Toaster />
    </div>
  );
}
