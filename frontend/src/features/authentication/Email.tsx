import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { Input, Button } from "@material-tailwind/react";
import { useTranslation } from "react-i18next";
import * as EmailValidator from "email-validator";

import { sendEmail } from "../../features/authentication/authSlice";
import { AppDispatch } from "../../redux/store";
import type { emailProps } from "./types";
import LoginGoogle from "./LoginGoogle";

export default function Email({ onTypeLogin, email, setEmail }: emailProps) {
  const { t } = useTranslation();
  const [isValidEmail, setIsValidEmail] = useState<boolean>(false);
  const [_useLogin, setUseLogin] = useState<string>("email");
  const dispatch = useDispatch<AppDispatch>();
  const inputEmailRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputEmailRef.current) {
      inputEmailRef.current.focus();
    }
    setIsValidEmail(EmailValidator.validate(email));
  }, []);

  const handleBackEmail = () => {
    dispatch(sendEmail(email));
    onTypeLogin("verify");
    handleUseLogin(email);
  };
  const enterBackEmail = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.which == 13 || e.keyCode == 13) && isValidEmail) {
      dispatch(sendEmail(email));
      onTypeLogin("verify");
      handleUseLogin(email);
    }
  };
  const checkIsEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setIsValidEmail(EmailValidator.validate(e.target.value));
  };

  const handleUseLogin = (use: string) => {
    setUseLogin(use);
  };

  return (
    <div className="container max-w-sm px-4 pb-4 flex flex-col items-center">
      <div className="bg-[url('assets/logo.webp')] bg-no-repeat w-64 h-64 mb-2 scale-75"></div>
      <h2 className="text-4xl mb-6 font-bold">{t("name")}</h2>
      <p className="text-4x1 text-center text-[rgb(112,117,121)] mb-6">
        {t("deslogin")}
      </p>
      <div className="w-full mb-4">
        <Input
          size="lg"
          label={t("labelEmail")}
          onChange={checkIsEmail}
          value={email}
          onKeyUp={enterBackEmail}
          ref={inputEmailRef}
          autoFocus={true}
          color="light-blue"
          crossOrigin="anonymous"
        />
      </div>
      <div className="w-full mb-6">
        <Button
          size="md"
          className="w-full"
          color="light-blue"
          disabled={!isValidEmail}
          onClick={handleBackEmail}
        >
          {t("submit")}
        </Button>
      </div>
      <div className="w-full relative my-1 text-center">
        <hr />
        <span className="px-3 relative bg-white -top-3"> {t("or")}</span>
      </div>
      <LoginGoogle />
    </div>
  );
}
