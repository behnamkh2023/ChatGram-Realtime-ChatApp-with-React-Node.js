import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { t } from "i18next";

import socket from "../../../services/ws";

export default function Istyping({ pvId }: { pvId: string }) {
  const [isTyping, setIsTyping] = useState(false);
  const [online, setOnline] = useState<boolean>(false);
  const { id } = useParams();

  useEffect(() => {
    socket.on(`online`, (activeUsers) => {
      if (activeUsers.some((u: { userId: string }) => u.userId === pvId)) {
        setOnline(true);
      }
    });

    socket.on(`offline`, (activeUsers) => {
      if (!activeUsers.some((u: { userId: string }) => u.userId === pvId)) {
        setOnline(false);
      }
    });

    socket.emit(`getOnline`);
    socket.on(`getOnline`, (activeUsers) => {
      if (activeUsers.some((u: { userId: string }) => u.userId === pvId)) {
        setOnline(true);
      }
    });
  }, []);

  let lastUpdateTime: number;
  useEffect(() => {
    socket.on(`istyping`, ({ sender }) => {
      if (id === sender) {
        lastUpdateTime = Date.now();
        if (!isTyping) {
          setIsTyping(true);
          let typingInterval = setInterval(() => {
            if (Date.now() - lastUpdateTime > 5000) {
              setIsTyping(false);
              if (typingInterval) {
                clearInterval(typingInterval);
              }
            }
          }, 5000);
        }
      }
    });

    socket.on(`send-message`, ({ sender, receiver }) => {
      if (pvId === sender || receiver === pvId) {
        setIsTyping(false);
      }
    });
  }, [id]);
  return (
    <span>
      {isTyping && id == pvId
        ? t("is typing...")
        : online
        ? t("online")
        : t("lastSeenRecently")}
    </span>
  );
}
