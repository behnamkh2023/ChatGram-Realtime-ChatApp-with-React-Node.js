import { Button } from "@material-tailwind/react";
import { useTranslation } from "react-i18next";

import Google from "../../assets/google.svg";

const LoginGoogle = () => {
  const { t } = useTranslation();
  const google = () => {
    window.open(`${import.meta.env.VITE_SERVER_ENDPOINT}/auth/google`, "_self");
  };
  return (
    <Button
      onClick={google}
      size="md"
      variant="outlined"
      color="blue-gray"
      className="flex items-center gap-3 w-full"
    >
      <img src={Google} alt="metamask" className="h-4 w-4" />
      <p>{t("cwGoogle")}</p>
    </Button>
  );
};

export default LoginGoogle;
