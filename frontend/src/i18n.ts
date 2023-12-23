import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      "language":"Language",
      "submit": "Submit",
      "name": "Chatgram",
      "deslogin": "Please enter your email address to receive the login code.",
      "labelEmail": "Your Email",
      "or": "Or",
      "cwGoogle": "Continue with Google",
      "textCodeSended": "We have sent the code to your email.",
      "wrongEmail": "Wrong email?",
      "confirm": "Confirm",
      "ladelCode": "Code",
      "online": "Online",
      "offline": "Offline",
      "lastSeenRecently": "last seen recently",
      "textLogout": "Are you sure you want to log out?",
      "cancel": "Cancel",
      "yes": "Yes",
      "is typing...": "Is typing...",
      "search": "Search",
      "textCopied": "Text copied successfully",
      "voiceMessage": "Voice message",
      "settings": "Settings",
      "firstName": "First Name",
      "lastName": "Last Name",
      "required": "Required",
      "optional": "Optional",
      "save": "Save",
      "saving": "Saving",
      "mistakeCode": "The code sent is not correct",
      "expireCode": "The code sent has expired",
      "deleteMessage": "Delete message",
      "desDeleteMessage": "Are you sure you want to delete this message?",
      "edited": "edited",
      "calling": "Calling",
      "callingYou": "Calling you",
      "loading...": "Loading...",
      "noMessage": "No message",
      "notFound": "No found",
      "today": "Today",
      "yesterday": "Yesterday",
      "monday": "Monday",
      "tuesday": "Tuesday",
      "wednesday": "Wednesday",
      "thursday": "Thursday",
      "friday": "Friday",
      "saturday": "Saturday",
      "sunday": "Sunday",
      "members": "members",
      "selectImage": "Select image",
      "editMessage": "Edit Message",
      "joinToChatgram": "join to chatgram",
      "secondToResend": "Second to resend",
      "resendTheCode": "Resend the code",
      "copy": "Copy",
      "edit": "Edit",
      "delete": "Delete",
      "reply": "Reply",
    }
  },
  fa: {
    translation: {
      "language":"زبان",
      "submit": "ارسال",
      "name": "چتگرام",
      "deslogin": "لطفا ایمیل خود را وارد کنید تا کد ورود برای شما ارسال شود.",
      "labelEmail": "ایمیل شما",
      "or": "یا",
      "cwGoogle": "ورود با گوگل",
      "textCodeSended": "ما کد را به ایمیل شما ارسال کرده ایم.",
      "wrongEmail": "ایمیل اشتباهه؟",
      "confirm": "تایید",
      "ladelCode": "کد",
      "online": "آنلاین",
      "offline": "آفلاین",
      "lastSeenRecently": "به تازگی دیده شده",
      "textLogout": "آیا برای خارج شدن مطمئن هستید؟",
      "cancel": "انصراف",
      "yes": "بله",
      "is typing...": "در حال نوشتن ...",
      "search": "جستجو",
      "textCopied": "متن با موفقیت کپی شد",
      "voiceMessage": "پیام صوتی",
      "settings": "تنظیمات",
      "firstName": "نام",
      "lastName": "نام خانوادگی",
      "required": "اجباری",
      "optional": "اختیاری",
      "save": "ذخیره",
      "saving": "در حال ذخیره",
      "mistakeCode": "کد ارسال شده اشتباه میباشد",
      "expireCode": "کد ارسال شده منقضی شده است",
      "deleteMessage": "حذف پیام",
      "desDeleteMessage": "آیا از حذف این پیام مطمئن هستید؟",
      "edited": "ویرایش شده",
      "calling": "در حال تماس با",
      "callingYou": "در حال تماس با شماست",
      "loading...": "در حال بارگیری...",
      "noMessage": "هیچ پیامی وجود ندارد",
      "notFound": "چنین کاربری وجود ندارد",
      "today": "امروز",
      "yesterday": "دیروز",
      "monday": "دوشنبه",
      "tuesday": "سه شنبه",
      "wednesday": "چهارشنبه",
      "thursday": "پنجشنبه",
      "friday": "جمعه",
      "saturday": "شنبه",
      "sunday": "یکشنبه",
      "members": "عضو",
      "selectImage": "انتخاب تصویر",
      "editMessage": "ویرایش پیام",
      "joinToChatgram": "به چتگرام پیوست",
      "secondToResend": "ثانیه  تا ارسال مجدد",
      "resendTheCode": "ارسال مجدد کد",
      "copy": "کپی",
      "edit": "ویرایش",
      "delete": "حذف",
      "reply": "پاسخ",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('selectedLanguage')??"en",
    fallbackLng: "en",
    supportedLngs: ["en", "fa"], 
    interpolation: {
      escapeValue: false
    }
  });

  export default i18n;