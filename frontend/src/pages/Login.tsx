import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Email from "../features/authentication/Email";
import Verify from "../features/authentication/Verify";
import Loading from "../components/Loading";
import BtnLang from "../components/BtnLang";
import { RootState } from "../redux/store";
export default function Login() {
  const [typeLogin, setTypeLogin] = useState<string>("email");
  const [email, setEmail] = useState("");

  const handleTypeLogin = (type: string) => {
    setTypeLogin(type);
  };
  const { loading, login, status } = useSelector(
    (state: RootState) => state.login
  );
  const navigate = useNavigate();
  if (loading) return <Loading />;

  if (login && status == 1) {
    navigate("/", { replace: true });
  }
  if (!login && status == 1) {
    return (
      <div className="container max-w-sm px-4 pt-4 pb-4 flex flex-col items-center h-screen mx-auto">
        <div className="mb-auto">
          {(() => {
            switch (typeLogin) {
              case "email":
                return (
                  <Email
                    email={email}
                    setEmail={setEmail}
                    onTypeLogin={handleTypeLogin}
                  />
                );
              case "verify":
                return <Verify email={email} onTypeLogin={handleTypeLogin} />;
              default:
                return null;
            }
          })()}
        </div>
        <div className="my-4">
          <BtnLang />
        </div>
      </div>
    );
  }
}
