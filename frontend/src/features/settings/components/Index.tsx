import { useState } from "react";
import { FiPower, FiEdit2, FiWifi, FiWifiOff, FiMail } from "react-icons/fi";
import { MdOutlineLanguage } from "react-icons/md";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import avatar from "../../../assets/user.jpg";
import { logout } from "../../../features/authentication/authSlice";
import Dialogs from "../../../components/Dialog";
import { copyToClipboard } from "../../../utils/functions";
import { AppDispatch, RootState } from "../../../redux/store";

export default function Index({
  onEditProfile,
}: {
  onEditProfile: (name: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const dispatch = useDispatch<AppDispatch>();
  const { data: user } = useSelector((state: RootState) => state.login);
  
  window.addEventListener("online", () => {
    setOnline(true);
  });
  window.addEventListener("offline", () => {
    setOnline(false);
  });

  const handleOpen = () => setOpenDialog(!openDialog);
  const onLogout = () => {
    dispatch(logout({ myId: user._id }));
  };
  return (
    <>
      <div className="">
        <img src={user?.avatar ?? avatar} alt="avatar" className="w-full" />
      </div>
      <motion.div
        initial={{ scale: 0.8, opacity: 0.6, x: 20 }}
        animate={{
          x: 0,
          transform: "scale(1)",
          opacity: 1,
          transition: { duration: 0.2, ease: "easeInOut" },
        }}
      >
        <div className="flex justify-between bg-white p-2 shadow mb-2 items-center">
          <div className="flex items-center p-2 truncate">
            <div className="pe-4 text-lg text-zinc-400">
              <span className="text-xl">@</span>
            </div>
            <p
              className="text-lg cursor-pointer"
              onClick={() => copyToClipboard({ text: user.username })}
            >{`${user.username}`}</p>
          </div>
          <div className="flex p-2">
            <div
              className="cursor-pointer"
              onClick={() => onEditProfile("editProfile")}
            >
              <FiEdit2 size={20} />
            </div>
            <div className="ms-4 cursor-pointer" onClick={handleOpen}>
              <FiPower size={20} />
            </div>
            <Dialogs
              title=""
              description={t("textLogout")}
              onHandler={onLogout}
              openDialog={openDialog}
              setOpenDialog={setOpenDialog}
            />
          </div>
        </div>
        <div className="flex flex-col bg-white p-2 shadow mb-2">
          <div className="flex items-center p-2 cursor-pointer rounded hover:bg-grey-100 truncate">
            <div className="pe-4 		text-zinc-400">
              <FiMail size={22} />
            </div>
            <div className="">
              <p
                className=""
                onClick={() => copyToClipboard({ text: user.email })}
              >
                {user.email}
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-between bg-white p-2 shadow mb-2 items-center">
          <div className="flex items-center p-2">
            <div className="pe-4 text-zinc-400">
              {online ? <FiWifi size={24} /> : <FiWifiOff size={24} />}
            </div>
            <p className="text-md">{online ? t("online") : t("offline")}</p>
          </div>
        </div>
        <div className="flex flex-col bg-white p-2 shadow mb-2">
          <div
            className="flex items-center p-2 cursor-pointer rounded hover:bg-grey-100"
            onClick={() => onEditProfile("lang")}
          >
            <div className="pe-4 text-zinc-400">
              <MdOutlineLanguage size={24} />
            </div>
            <div className="flex justify-between w-full">
              <p className="">{t("language")}</p>
              <p className="text-zinc-400">
                {i18n.language == "fa" ? "فارسی" : "English"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
