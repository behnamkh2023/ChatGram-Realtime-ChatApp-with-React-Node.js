import React, { useEffect, useState, useRef, RefObject } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Item, Menu, useContextMenu } from "react-contexify";
import { t } from "i18next";
import { FiCornerUpLeft, FiCopy, FiEdit2, FiTrash } from "react-icons/fi";

import ChatMessage from "./ChatMessage";
import socket from "../../../services/ws";
import Scroll from "./Scroll";
import http from "../../../services/httpService";
import Dialogs from "../../../components/Dialog";
import { RootState } from "../../../redux/store";
import { copyToClipboard, formatCreatedAt } from "../../../utils/functions";
import Uploading from "./Uploading";
import type { Message, MessageRefType, NewMsgs } from "../types";

const MENU_ID = "blahblah";
export default function ChatMessages() {
  const { id } = useParams();
  const {
    login: { data },
    userPv: { pv },
  } = useSelector((state: RootState) => state);

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newMsgs, setNewMsgs] = useState<NewMsgs>({
    index: 0,
    id: "",
  });
  const [_ani, setAni] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Message | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [messageRefs, setMessageRefs] = useState<{
    [key: string]: React.RefObject<HTMLDivElement>;
  }>({});
  const mainRef = useRef<HTMLDivElement | null>(null);
  const [replyActive, setReplyActive] = useState<string>();
  const handleItemClickMsg = (item: string | null) => {
    const msgs = messages.find((msg) => msg._id == item);
    if (msgs) {
      setSelectedItem(msgs);
    }
  };

  const bottomRef: RefObject<HTMLDivElement> = useRef(null);
  const unreadRef: RefObject<HTMLDivElement> = useRef(null);
  useRef<MessageRefType>();
  async function fetchData() {
    try {
      const res = await http.get("/messages", {
        params: { pvId: id, myId: data._id },
      });
      setMessages(res.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  useEffect(() => {
    const createMessageRefs = () => {
      const refs: { [key: string]: React.RefObject<HTMLDivElement> } = {};
      messages.forEach((msg: Message) => {
        refs[msg._id] = React.createRef();
      });
      return refs;
    };
    const newMessageRefs = createMessageRefs();
    setMessageRefs(newMessageRefs);

    socket.on("deleteMsg", ({ idMsg }) => {
      removeItemById(idMsg);
    });
  }, [messages]);

  const removeItemById = (idToRemove: string) => {
    const updatedArray = messages.filter((item) => item._id !== idToRemove);
    setMessages(updatedArray);
  };
  useEffect(() => {
    fetchData();
    getAllStatusSeen(messages);
    socket.on(`send-message`, ({ messages, sender, receiver }) => {
      if (id === sender || receiver === id) {
        setMessages(messages);
      }
    });
    socket.on("getNewMessages", ({ newMessages, sender, receiver }) => {
      if (id === sender || receiver === id) {
        const { index, id } = getAllStatusSeen(newMessages);
        setMessages(newMessages);
        setNewMsgs({ index, id });
        setAni(true);
      }
    });
  }, [id]);
  useEffect(() => {
    setTimeout(() => {
      if (unreadRef.current != null) {
        if (unreadRef.current) {
          (unreadRef.current as unknown as HTMLElement).scrollIntoView({
            behavior: "auto",
            block: "center",
          });
        }
      } else {
        if (bottomRef.current) {
          (bottomRef.current as unknown as HTMLElement).scrollIntoView({
            behavior: "auto",
          });
        }
      }
    }, 10);
  }, [messages]);

  const { show } = useContextMenu({
    id: MENU_ID,
    props: {
      key: "value",
    },
  });

  useEffect(() => {
    const handleClickOutside = () => {
      setSelectedItem(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);
  function handleContextMenu(
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) {
    event.preventDefault();
    show({
      event,
    });
  }
  const handleItemClick = ({ id }: { id: string }) => {
    switch (id) {
      case "reply":
        if (selectedItem?.message) {
          replyHandler(selectedItem.message, selectedItem._id);
        }
        break;
      case "edit":
        if (selectedItem?.message) {
          editHandler(selectedItem.message, selectedItem._id);
        }
        break;
      case "copy":
        if (selectedItem?.message) {
          copyToClipboard({ text: selectedItem.message });
        }

        break;
      case "delete":
        setOpenDialog(true);
        break;
    }
  };
  const replyHandler = async (text: string, msgId: string) => {
    document.body.click();
    socket.emit("replyMsg", {
      msg: text,
      msgId,
      receiver: id,
      sender: data._id,
    });
  };
  const editHandler = async (text: string, msgId: string) => {
    document.body.click();
    socket.emit("editMsg", {
      msg: text,
      msgId,
      receiver: id,
      sender: data._id,
    });
  };
  const deleteHandler = () => {
    socket.emit("deleteMsg", {
      idMsg: selectedItem?._id,
      pvId: id,
      myId: data._id,
    });
    setOpenDialog(false);
  };

  const handleReplyClick = (id: string) => {
    const repliedMessage = messages.find((message) => message._id === id);
    if (repliedMessage && repliedMessage.reply !== null) {
      const repliedId = repliedMessage.reply;
      if (repliedId != undefined) {
        if (messageRefs[repliedId] && messageRefs[repliedId].current) {
          setReplyActive(repliedId);
          const repliedElement = messageRefs[repliedId].current;
          repliedElement?.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  const getAllStatusSeen = (allMessages: Message[]) => {
    const index = allMessages
      .slice()
      .reverse()
      .findIndex((obj) => obj.seen === "1");
    if (index !== -1) {
      const length = allMessages.length;
      const msgIndex = length - index;
      // const firstSeenOneObject =
      allMessages.slice(msgIndex, length);
      return { index, id: allMessages[msgIndex]?._id };
    } else {
      return {};
    }
  };
  return (
    <div
      className="mainContent h-[calc(100vh-112px)] overflow-auto"
      ref={mainRef}
    >
      {messages.length > 0 ? (
        <>
          <div className="flex flex-col justify-end min-h-full ">
            {addDateToMsg(messages).map((msgss, idx) => {
              return (
                <div
                  key={`${msgss?.date}${idx}`}
                  className="flex flex-col relative"
                >
                  {msgss?.date ? (
                    <div className="w-full h-8 text-white flex justify-center items-center sticky top-4 z-30">
                      <div className="bg-[#3074858c] text-sm px-3 py-1 rounded-full font-normal">
                        {msgss?.date}
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {msgss.messages.map((msg1: Message) => {
                    return (
                      <>
                        {newMsgs?.id == msg1._id &&
                        data._id == msg1.receiver &&
                        newMsgs.index &&
                        newMsgs.index > 5 ? (
                          <div
                            ref={unreadRef}
                            className="w-full h-8 text-white flex justify-center items-center z-1"
                          >
                            <div className="bg-[#3074858c] text-sm px-3 py-1 rounded-full font-normal">
                              Unread Messages
                            </div>
                          </div>
                        ) : (
                          ""
                        )}
                        <div
                          key={msg1._id}
                          className={`messageId relative inline-block text-left dropdown z-0 
                          // {
                            // messages[messages.length - 1]._id == msg1._id &&
                            // ani &&
                            // "animated-fadeInAndScale"
                          // }
                          `}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            handleItemClickMsg(msg1._id);
                            handleContextMenu(e);
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            handleItemClickMsg(null);
                          }}
                        >
                          <ChatMessage
                            message={msg1}
                            id={id}
                            user={pv}
                            me={data}
                            isSelected={selectedItem?._id === msg1._id}
                            replyActive={replyActive}
                            onReplyClick={handleReplyClick}
                            forwardedRef={
                              messageRefs[msg1._id !== null ? msg1._id : 0]
                            }
                          />
                        </div>
                      </>
                    );
                  })}
                </div>
              );
            })}
            <div>
              <Uploading />
            </div>
            <div ref={bottomRef}></div>
          </div>
          {newMsgs.index! > 5 && messages[messages.length - 1].sender == id && (
            <Scroll id={id} bottomRef={bottomRef} newMsgs={newMsgs} />
          )}
          <Menu
            animation={{ enter: "fade", exit: "flip" }}
            id={MENU_ID}
            className=" backdrop-blur bg-white bg-opacity-75 p-2 rounded-md"
          >
            <Item id="reply" onClick={() => handleItemClick({ id: "reply" })}>
              <div className="flex">
                <FiCornerUpLeft size={16} className="mt-0.5 text-[#7f8c8d]" />
                <div className="mx-3 text-sm mt-0.5 text-black">{t("reply")}</div>
              </div>
            </Item>
            {selectedItem?.type == "msg" &&
              selectedItem.sender == data?._id && (
                <Item id="edit" onClick={() => handleItemClick({ id: "edit" })}>
                  <div className="flex ">
                    <FiEdit2 size={16} className="mt-0.5 text-[#7f8c8d]" />{" "}
                    <div className="mx-3 text-sm mt-0.5 text-black">{t("edit")}</div>
                  </div>
                </Item>
              )}
            {selectedItem?.type == "msg" && (
              <Item id="copy" onClick={() => handleItemClick({ id: "copy" })}>
                <div className="flex">
                  <FiCopy size={16} className="mt-0.5 text-[#7f8c8d]" />
                  <div className="mx-3 text-sm mt-0.5 text-black">
                    {t("copy")}
                  </div>
                </div>
              </Item>
            )}
            {selectedItem?.sender == data?._id && (
              <Item
                id="delete"
                onClick={() => handleItemClick({ id: "delete" })}
              >
                <div className="flex">
                  <FiTrash size={16} className="mt-0.5 text-[#e66767]" />
                  <div className="mx-3 text-sm mt-0.5 text-[#e66767]">
                    {t("delete")}
                  </div>
                </div>
              </Item>
            )}
          </Menu>
          <Dialogs
            title={t("deleteMessage")}
            description={t("desDeleteMessage")}
            openDialog={openDialog}
            onHandler={deleteHandler}
            setOpenDialog={setOpenDialog}
          />
        </>
      ) : (
        <div className="flex flex-col justify-center min-h-full items-center">
          <p className="p-4 inline-flex flex-col items-center bg-[#248da287] min-w-fit rounded-lg text-white">
            {loading ? t("loading...") : t("noMessage")}
          </p>
        </div>
      )}
    </div>
  );
}

const addDateToMsg = (messages: Message[]) => {
  const categorizedMessages = new Map();
  messages.forEach((item) => {
    if (item.createdAt) {
      const formattedDate = formatCreatedAt(item.createdAt);
      if (!categorizedMessages.has(formattedDate)) {
        categorizedMessages.set(formattedDate, {
          date: formattedDate,
          messages: [],
        });
      }
      const category = categorizedMessages.get(formattedDate);
      category.messages.push(item);
    }
  });
  const resultArray = Array.from(categorizedMessages.values());
  return resultArray;
};
