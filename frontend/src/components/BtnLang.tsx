import { Button } from "@material-tailwind/react";
import { useTranslation } from "react-i18next";

function BtnLang() {
    const {i18n } = useTranslation();
    const changeLanguage = (lng: string) => {
      i18n.changeLanguage(lng);
      localStorage.setItem("selectedLanguage", lng);
    };
  return (
    <div>

    {i18n.language == "en" ? (
      <Button type="button" variant="text"  size="sm" onClick={() => changeLanguage("fa")}>
        فارسی
      </Button>
    ) : (
      <Button type="button" variant="text" size="sm" onClick={() => changeLanguage("en")}>
        English
      </Button>
    )}
  </div>
  )
}

export default BtnLang