import React, {
  forwardRef,
  ForwardedRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import moment from "moment";
import { t } from "i18next";
import { BiCheck, BiCheckDouble } from "react-icons/bi";
import "react-contexify/ReactContexify.css";
import { InView } from "react-intersection-observer";

import avatar from "../../../assets/user.jpg";
import socket from "../../../services/ws";
import Voice from "./Voice";
import File from "./File";
import i18n from "../../../i18n";
import type { ChatMessageProps, Message } from "../types";

const ChatMessage: React.FC<
  ChatMessageProps & { forwardedRef: ForwardedRef<HTMLDivElement> }
> = forwardRef(
  (
    { message, id, user, me, isSelected, replyActive, onReplyClick },
    forwardedRef
  ) => {
    const messageRef = useRef<HTMLDivElement | null>(null);
    const [msg, setMsg] = useState(message);
    const [isOpen, setIsOpen] = useState(false);
    const [activeReply, setActiveReply] = useState(false);

    useEffect(() => {
      setActiveReply(replyActive == message._id);
      const timeoutId = setTimeout(() => {
        setActiveReply(false);
      }, 2000);

      return () => clearTimeout(timeoutId);
    }, [replyActive]);

    useImperativeHandle(
      forwardedRef,
      () => ({
        scrollIntoView: () => {
          if (messageRef.current) {
            messageRef.current.scrollIntoView({ behavior: "smooth" });
          }
        },
      }),
      [messageRef]
    );
    useEffect(() => {
      setIsOpen(true);
    }, []); 
    useEffect(() => {
      setIsOpen(isSelected);
    }, [isSelected]);
    let m;
    if (message.type === "msg") {
      m = message.message.split("\n").map((line: string, index: number) => (
        <p className="rtl:text-right ltr:text-left" key={index}>
          {line}
        </p>
      ));
    } else if (message.type === "voice") {
      m = <Voice message={message} />;
    } else if (message.type === "img") {
      m = <img src={message.message} />;
    } else if (message.type === "file") {
      m = <File message={message} />;
    }
    useEffect(() => {
      socket.on(`seenById${message._id}`, () => {
        setMsg((prevState) => {
          return {
            ...prevState,
            seen: "1",
          };
        });
      });
    }, []);

    return (
      <InView
        as="div"
        threshold={0.5}
        onChange={(inView, entry) => {
          if (message.seen == "0" && message.sender == id && inView) {
            socket.emit("seenById", {
              msgId: message._id,
              sender: id,
              receiver: localStorage.getItem("userId"),
              msg: message.message,
            });
          }
        }}
      >
        <div
          ref={messageRef}
          id={message._id}
          className={`py-1 rounded-none
      ${isOpen ? "bg-gray-900 bg-opacity-10" : ""}
      ${activeReply ? "bg-gray-900 bg-opacity-10" : ""}
      `}
        >
          {message.userID1 == id ? (
            <div
              className={`w-full mt-2 px-3 py-1 flex items-end ${
                isOpen ? "open-dropdown" : ""
              }`}
            >
              <img
                className="w-8 h-8 me-2 rounded-full"
                src={user.avatar ?? avatar}
              />
              <div className="relative">
                {i18n.dir() == "rtl" ? <SvgRightMessage /> : <SvgLeftMessage />}

                <p
                  className={`max-w-xs  overflow-hidden	w-fit	bg-white p-2 rounded-lg  flex flex-col ${
                    i18n.dir() == "rtl" ? "rounded-br-none" : "rounded-bl-none"
                  }`}
                >
                  {!!message.reply && (
                    <div
                      className="flex justify-between w-full items-center py-1 cursor-pointer"
                      onClick={() => onReplyClick(message._id)}
                    >
                      <div className="flex-1 border-s-4 border-blue-300 bg-[#90aaed1a] rounded-md p-2 pb-1 overflow-hidden">
                        <div className="text-blue-300 text-[16px] leading-4 rtl:text-right ltr:text-left">
                          {message?.replyUsername}
                        </div>
                        <p className="text-[12px] leading-3 pt-1 truncate rtl:text-right ltr:text-left">
                          {getReplyMsgFromChat(message)}
                        </p>
                      </div>
                    </div>
                  )}
                  {m}
                  <span className="MessageMeta flex ltr:flex-row-reverse ml-auto">
                    <span className="message-time text-xs ml-2 relative -bottom-1">
                      {moment(msg.updatedAt).format("HH:mm")}
                    </span>
                    <span className="message-time text-xs mt-1 ml-1">
                      {message.edited && t("edited")}
                    </span>
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <div
              className={`w-full mt-2 px-3 py-1 flex items-end justify-end ${
                isOpen ? "open-dropdown" : ""
              }`}
            >
              <div className="relative">
                {i18n.dir() == "rtl" ? <SvgLeftMessage /> : <SvgRightMessage />}

                <p
                  className={`max-w-xs overflow-hidden w-fit bg-white p-2 rounded-lg ${
                    i18n.dir() == "rtl" ? "rounded-bl-none" : "rounded-br-none"
                  }`}
                >
                  {!!message.reply && (
                    <div
                      onClick={() => onReplyClick(message._id)}
                      className="flex justify-between w-full items-center py-1 cursor-pointer"
                      dir={i18n.dir()}
                    >
                      <div className="flex-1 border-s-4 border-blue-300 bg-[#90aaed1a] rounded-md p-2 pb-1 overflow-hidden">
                        <div className="text-blue-300 text-[16px] leading-4 rtl:text-right ltr:text-left">
                          {message?.replyUsername}
                        </div>
                        <p className="text-[12px] leading-3 pt-1 truncate rtl:text-right ltr:text-left">
                          {getReplyMsgFromChat(message)}
                        </p>
                      </div>
                    </div>
                  )}
                  {m}
                  <span
                    className="MessageMeta flex flex-row-reverse relative -bottom-1"
                    dir="ltr"
                  >
                    <span className="ml-1">
                      {msg.seen === "0" ? (
                        <BiCheck />
                      ) : (
                        <BiCheckDouble color="#0984e3" />
                      )}
                    </span>
                    <span className="message-time text-xs ml-1">
                      {moment(msg.updatedAt).format("HH:mm")}
                    </span>
                    <span className="message-time text-xs ml-1">
                      {message.edited && t("edited")}
                    </span>
                  </span>
                </p>
              </div>
              <img
                className="w-8 h-8 ms-2 rounded-full"
                src={me.avatar ?? avatar}
              />
            </div>
          )}
        </div>
      </InView>
    );
  }
);

function SvgRightMessage() {
  return (
    <div className="svg-appendix absolute -bottom-06 -right-05">
      <svg width="9" height="20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter
            x="-50%"
            y="-14.7%"
            width="200%"
            height="141.2%"
            filterUnits="objectBoundingBox"
            id="a"
          >
            <feOffset
              dy="1"
              in="SourceAlpha"
              result="shadowOffsetOuter1"
            ></feOffset>
            <feGaussianBlur
              stdDeviation="1"
              in="shadowOffsetOuter1"
              result="shadowBlurOuter1"
            ></feGaussianBlur>
            <feColorMatrix
              values="0 0 0 0 0.0621962482 0 0 0 0 0.138574144 0 0 0 0 0.185037364 0 0 0 0.15 0"
              in="shadowBlurOuter1"
            ></feColorMatrix>
          </filter>
        </defs>
        <g fill="none" fillRule="evenodd">
          <path
            d="M6 17H0V0c.193 2.84.876 5.767 2.05 8.782.904 2.325 2.446 4.485 4.625 6.48A1 1 0 016 17z"
            fill="#000"
            filter="url(#a)"
          ></path>
          <path
            d="M6 17H0V0c.193 2.84.876 5.767 2.05 8.782.904 2.325 2.446 4.485 4.625 6.48A1 1 0 016 17z"
            fill="#FFF"
            className="corner"
          ></path>
        </g>
      </svg>
    </div>
  );
}
function SvgLeftMessage() {
  return (
    <div className="svg-appendix absolute -bottom-06 -left-2">
      <svg width="9" height="20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter
            x="-50%"
            y="-14.7%"
            width="200%"
            height="141.2%"
            filterUnits="objectBoundingBox"
            id="a"
          >
            <feOffset
              dy="1"
              in="SourceAlpha"
              result="shadowOffsetOuter1"
            ></feOffset>
            <feGaussianBlur
              stdDeviation="1"
              in="shadowOffsetOuter1"
              result="shadowBlurOuter1"
            ></feGaussianBlur>
            <feColorMatrix
              values="0 0 0 0 0.0621962482 0 0 0 0 0.138574144 0 0 0 0 0.185037364 0 0 0 0.15 0"
              in="shadowBlurOuter1"
            ></feColorMatrix>
          </filter>
        </defs>
        <g fill="none" fillRule="evenodd">
          <path
            d="M3 17h6V0c-.193 2.84-.876 5.767-2.05 8.782-.904 2.325-2.446 4.485-4.625 6.48A1 1 0 003 17z"
            fill="#000"
            filter="url(#a)"
          ></path>
          <path
            d="M3 17h6V0c-.193 2.84-.876 5.767-2.05 8.782-.904 2.325-2.446 4.485-4.625 6.48A1 1 0 003 17z"
            fill="#FFF"
            className="corner"
          ></path>
        </g>
      </svg>
    </div>
  );
}
const getReplyMsgFromChat = (chat: Message) => {
  let msg: string | undefined;
  switch (chat.replyType) {
    case "voice":
      msg = "🎤 Voice message";
      break;
    case "img":
      msg = `📷 Photo`;
      break;
    case "file":
      msg = `📂 ${chat.replyFile?.name}`;
      break;
    case "msg":
      msg = chat.replyMessage;
      break;
    default:
      break;
  }
  return msg;
};
export default React.memo(ChatMessage);
