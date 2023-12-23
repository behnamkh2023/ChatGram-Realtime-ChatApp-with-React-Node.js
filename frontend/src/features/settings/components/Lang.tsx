import React from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { Radio, Typography } from "@material-tailwind/react";
import { motion } from "framer-motion";

import { setLang } from "../settingsSlice";
const langs = [
  { id: "english", value: "en", name: "English", label: "English" },
  { id: "persian", value: "fa", name: "Persian", label: "فارسی" },
];
export default function Lang({
  onEditProfile,
}: {
  onEditProfile: (name: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const changeLanguageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const languageValue = e.target.value;
    i18n.changeLanguage(languageValue);
    document.dir = i18n.dir();
    localStorage.setItem("selectedLanguage", i18n.language);
    dispatch(setLang(languageValue));
  };
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0.6, x: 20 }}
      animate={{
        x: 0,
        transform: "scale(1)",
        opacity: 1,
        transition: { duration: 0.2, ease: "easeInOut" },
      }}
    >
      <div className="flex flex-col bg-white p-4 shadow mb-2">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => onEditProfile("settings")}
        >
          <div>
            {i18n.dir() == "ltr" ? (
              <FiArrowLeft fontSize={24} />
            ) : (
              <FiArrowRight fontSize={24} />
            )}
          </div>
          <div className="text-lg	ltr:ml-4 rtl:mr-4">{t("language")}</div>
        </div>
      </div>
      <div className="flex flex-col bg-white p-4 shadow mb-2">
        <div className="flex-col items-center mb-4">
          {langs.map((item) => {
            return (
              <div
                key={item.id}
                className=" flex justify-between w-full items-center py-2"
              >
                <p className=" cursor-pointer">
                  <Radio
                    id={item.id}
                    name="lang"
                    value={item.value}
                    label={ <Typography className="font-normal text-base">{item.label}</Typography>}
                    checked={i18n.language == item.value}
                    onChange={changeLanguageHandler}
                    crossOrigin="anonymous"
                    className="font-bold"
                  />
                </p>
                <p className=" text-zinc-400">{item.name}</p>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
