import { ReactNode, useEffect, useState } from "react";
import { Link ,useParams} from "react-router-dom";
import moment from "moment";
import { t } from "i18next";

import socket from "../../../services/ws";
import avatar from "../../../assets/user.jpg";
import type { User } from "../types";

type InfoMsg = {
  msg: string | ReactNode;
  time: string;
  seen: string;
};
export default function User({ item, me }: { item: User; me: string }) {
  const [row, _setRow] = useState(item);
  const [infoMsg, setInfoMsg] = useState<InfoMsg>({
    msg: "",
    time: "",
    seen: "",
  });
  const { id } = useParams();
  const [isTyping, setIsTyping] = useState(false);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    socket.on(`online`, (activeUsers) => {
      if (
        activeUsers.some((user: { userId: string }) => user.userId === item._id)
      ) {
        setOnline(true);
      }
    });

    socket.on(`offline`, (activeUsers) => {
      if (
        !activeUsers.some(
          (user: { userId: string }) => user.userId === item._id
        )
      ) {
        setOnline(false);
      }
    });
    socket.emit(`getOnline`, { userId: item._id });
    socket.on(`getOnline`, (activeUsers) => {
      if (
        activeUsers.some((user: { userId: string }) => user.userId === item._id)
      ) {
        setOnline(true);
      }
    });
    let lastUpdateTime: number;
    socket.on(`istyping`, ({ sender }) => {
      lastUpdateTime = Date.now();
      if (item._id === sender) {
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
  }, []);
  useEffect(() => {
    socket.on(`info-user${item._id}`, (info) => {
      setInfoMsg((p) => {
        return {
          ...p,
          seen: info.length,
        };
      });
    });
    socket.emit("info-user", { item, me });
    socket.on(`info-user`, (info) => {
      if ((item._id == info.id && me == info.me) || item._id == info.me) {
        let msg: string | ReactNode;
        if (info.type == "voice") {
          msg = `🎤 ${t("voiceMessage")}`;
        } else if (info.type == "img") {
          msg = <img className="rounded w-4 h-4" src={info.msg} />;
        } else if (info.type == "file") {
          msg = `📂 ${info.file.name}`;
        } else {
          msg = info.msg;
        }

        setIsTyping(false);
        setInfoMsg((p) => {
          return {
            ...p,
            msg: msg,
            time: info.time,
            seen: info.seen,
          };
        });
      }
    });
  }, []);

  return (
    <Link to={`/pv/${row._id}`} key={row._id}>
      <div
        className={`ListItem cursor-pointer flex items-center my-1 p-3 w-full hover:bg-zinc-100 rounded-lg ${
          row._id == id && "bg-zinc-100"
        }`}
      >
        <div className="Avatar flex-none w-10 h-10 me-3 rounded-full bg-blue-grey-50 relative">
          <img
            className="rounded-full w-full h-full"
            src={row.avatar ?? avatar}
          />
          {online && (
            <span className="w-2 h-2 bg-[#00d000] absolute right-0 rounded-full bottom-1"></span>
          )}
        </div>
        <div className="leading-5 flex-1 overflow-hidden">
          <div className="title flex justify-between">
            {row.firstName != "" ? (
              <h2 className="truncate">
                <b>{`${row.username}`}</b>
              </h2>
            ) : (
              <h2 className="truncate overflow-ellipsis w-auto">
                <b>{row.email.slice(5).padStart(row.email.length, "*")}</b>
              </h2>
            )}
            <div className="LastMessageMeta text-xs text-[rgb(112,117,121)] w-14 whitespace-nowrap">
              <span className="time">
                {infoMsg.time && moment(infoMsg.time).format("LT")}
              </span>
            </div>
          </div>
          <div className="text-sm text-[rgb(112,117,121)] flex w-full justify-between">
            {isTyping ? (
              <p className="truncate pr-1 grow"> {t("is typing...")} </p>
            ) : infoMsg.msg ? (
              <p className="truncate pr-1 min-w-16 max-w-full"> {infoMsg.msg} </p>
            ) : row.username != "" ? (
              <p className="truncate pr-1 grow">
                {" "}
                {`${row.username} ${t("joinToChatgram")}`}
              </p>
            ) : (
              <>
                <p className="truncate pr-1 w-32">
                  {row.email.slice(5).padStart(row.email.length, "*")}
                </p>
                <span>{t("joinToChatgram")}</span>
              </>
            )}
            <div className="Badge-transition grow-0">
              {Number(infoMsg.seen) > 0 && (
                <div className="Badge muted unread bg-[#00d000] rounded-full text-white px-2 pt-0.5">
                  {infoMsg.seen}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
