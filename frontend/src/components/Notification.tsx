import socket from "../services/ws";

const Notification: React.FC = () => {
  const audio = new Audio(`${import.meta.env.VITE_SERVER_URL}/Telegram.mp3`);
  const icon = document.querySelector(
    "link[rel*='icon']"
  ) as HTMLLinkElement | null;
  const iconHref = icon?.href || null;
  const pageTitle = document.title;

  socket.on("notification", () => {
    if (document.hidden) {
      audio.play();

      if (document.title === pageTitle) {
        document.title = "1 notification";
        if (icon) {
          icon.href = "#";
        }
      } else {
        setTimeout(() => {
          document.title = pageTitle;
          if (icon && iconHref !== null) {
            icon.href = iconHref;
          }
        }, 1000);
      }
    } else {
      setTimeout(() => {
        document.title = pageTitle;
        if (icon && iconHref !== null) {
          icon.href = iconHref;
        }
      }, 1000);
    }
  });
  return null;
};

export default Notification;






