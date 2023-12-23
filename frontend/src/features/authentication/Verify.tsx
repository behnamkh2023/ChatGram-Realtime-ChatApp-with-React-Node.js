import { useEffect, useState, useRef } from "react";
import OtpInput from "react-otp-input";
import { useSelector, useDispatch } from "react-redux";
import { Button, Tooltip } from "@material-tailwind/react";
import { useTranslation } from "react-i18next";

import {
  confirmCode,
  sendEmail,
} from "../../features/authentication/authSlice";
import useCustomToast from "../../hooks/Toast";
import { AppDispatch, RootState } from "../../redux/store";
import type { verifyProps } from "./types";

export default function Verify({ onTypeLogin, email }: verifyProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [timeExpire, setTimeExpire] = useState(90);
  const dispatch = useDispatch<AppDispatch>();
  const { defaultToast } = useCustomToast();
  const { login } = useSelector((state: RootState) => state);
  const inputVerifyRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (login.error == "mistake") {
      defaultToast(t("mistakeCode"), "error");
    }
    if (login.error == "expire") {
      defaultToast(t("expireCode"), "error");
    }
  }, [login.error]);

  useEffect(() => {
    if (inputVerifyRef.current) {
      inputVerifyRef.current.focus();
    }
    const interval = setInterval(() => {
      if (timeExpire > 0) {
        setTimeExpire((prev) => prev - 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleBack = () => {
    setCode("");
    onTypeLogin("email");
  };

  const handleConfirmCode = () => {
    dispatch(confirmCode({ email, code }));
  };
  return (
    <div className="container max-w-sm px-4 pb-4 flex flex-col items-center">
      <div className="bg-[url('assets/logo.webp')] bg-no-repeat w-64 h-64 mb-2 scale-75"></div>
      <h2 className="text-2xl mb-6 font-semibold flex" dir="ltr">
        <p className="w-64 truncate">{email}</p>
        <Tooltip content={t("wrongEmail")}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-[rgb(112,117,121)] ml-4 mt-1.5 cursor-pointer"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            onClick={handleBack}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </Tooltip>
      </h2>
      <p className="text-4x1 text-center text-[rgb(112,117,121)] mb-6">
        {t("textCodeSended")}
      </p>

      <div className="w-full mb-6" dir="ltr">
        <OtpInput
          value={code}
          onChange={setCode}
          numInputs={6}
          renderSeparator={<span>-</span>}
          shouldAutoFocus={true}
          inputStyle={{
            width: "2.5rem",
            padding: "0.5rem 0.2rem",
            border: "1px solid #adadad",
            borderRadius: "0.5rem",
          }}
          containerStyle="flex gap-x-2 justify-center"
          renderInput={(props) => <input {...props} />}
        />
      </div>
      {code.length == 6 && (
        <div className="w-full mb-6">
          <Button
            size="lg"
            color="light-blue"
            className="w-full"
            onClick={handleConfirmCode}
          >
            {t("confirm")}
          </Button>
        </div>
      )}
      {timeExpire > 0 ? (
        <div className="flex">
          <time className="mx-2"> {timeExpire} </time>{" "}
          <p> {t("secondToResend")} </p>
        </div>
      ) : (
        <Button
          variant="text"
          color="gray"
          onClick={() => {
            setTimeExpire(90);
            dispatch(sendEmail(email));
          }}
          className="mx-1 text-sm"
        >
          <span>{t("resendTheCode")}</span>
        </Button>
      )}
    </div>
  );
}
