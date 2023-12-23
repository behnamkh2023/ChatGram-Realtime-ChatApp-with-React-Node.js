import React, { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { IoMdSend } from "react-icons/io";
import { useAudioRecorder } from "react-audio-voice-recorder";
import data from "@emoji-mart/data";
import { HiReply, HiOutlinePencil, HiX } from "react-icons/hi";
import Picker from "@emoji-mart/react";
import { t } from "i18next";
import { FiSmile, FiX } from "react-icons/fi";

import socket from "../../../services/ws";
import Dialogs from "../../../components/Dialog";
import http from "../../../services/httpService";
import { focusToEnd, isMobileDevice } from "../../../utils/functions";
import { RootState } from "../../../redux/store";
type replyType = {
  draftId: string;
  msg: string;
  msgId: string;
  username: string;
};
function InputMsg() {
  const {
    startRecording,
    stopRecording,
    recordingBlob,
    isRecording,
  } = useAudioRecorder();
  const [message, setMessage] = useState("");
  // const [record, setRecord] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reply, setReply] = useState<replyType | null>();
  const [edit, setEdit] = useState<replyType | null>();
  const messageRef = useRef<HTMLDivElement | null>(null);

  const { id } = useParams();
  const pvId = id;
  const {
    login: {
      data: { _id: myId },
    }
  } = useSelector((state: RootState) => state);

  useEffect(() => {
    if (!recordingBlob) return;
    const formData = new FormData();
    recordingBlob && formData.append("voiceMessage", recordingBlob);
    myId && formData.append("sender", myId);
    pvId && formData.append("receiver", pvId);

    http
      .post(`${import.meta.env.VITE_SERVER_ENDPOINT}/uploadVoice`, formData, {
        onUploadProgress: (progressEvent) => {
          if(progressEvent.total != undefined){
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            socket.emit("uploadPercentage", {
              progress,
              type: "voice",
              pvId,
              myId,
            });
          }
        },
      })
      .then((res) => {
        const replyId = reply ? reply.msgId : "";
        const chatId = edit ? edit.msgId : null;
        socket.emit("uploadVoice", {
          id: res.data.id,
          path: res.data.filePath,
          sender: myId,
          receiver: pvId,
          reply: replyId,
          chatId,
        });
        setMessage("");
        setReply(null);
        setEdit(null);
        setShowEmojiPicker(false);
        if (messageRef.current) {
          messageRef.current.innerText = "";
        }
        setMessage("");
      })
      .catch(() => {});
  }, [recordingBlob]);

  const handleMessageChange = () => {
    let newText;
    if (messageRef.current) {
      newText = messageRef.current.innerText;
      setMessage(newText);
    }
    socket.emit(`istyping`, { msg: newText, reciver: pvId, sender: myId });
  };
  const sendMsg = () => {
    const replyId = reply ? reply.msgId : "";
    const chatId = edit ? edit.msgId : null;
    if (messageRef.current && messageRef.current.innerText.trim() !== "") {
      socket.emit("send-message", {
        msg: message,
        sender: myId,
        receiver: pvId,
        replyId,
        chatId,
      });
      setMessage("");
      setReply(null);
      setEdit(null);
      setShowEmojiPicker(false);
      if (messageRef.current) {
        messageRef.current.innerText = "";
      }
    } else {
      setMessage("");
    }
  };
  function isImageFile(file: File) {
    return file.type.startsWith("image/");
  }
  const sendImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files == null) return;
    const selectedFile = e.target.files[0];
    const formData = new FormData();
    myId && formData.append("sender", myId);
    pvId && formData.append("receiver", pvId);
    let endpoint = "";
    if (selectedFile != undefined) {
      if (selectedFile.size > 3000000000) {
        setOpenDialog(true);
      } else {
        if (isImageFile(selectedFile)) {
          formData.append("image", e.target.files[0]);
          endpoint = "uploadImage";
        } else {
          formData.append("file", e.target.files[0]);
          endpoint = "uploadFile";
        }

        http
          .post(
            `${import.meta.env.VITE_SERVER_ENDPOINT}/${endpoint}`,
            formData,
            {
              headers: {
                "Cache-Control": "no-cache",
              },

              onUploadProgress: (progressEvent) => {
                if (progressEvent.total != undefined) {
                  const progress =
                    (progressEvent.loaded / progressEvent.total) * 100;
                  socket.emit("uploadPercentage", {
                    progress,
                    type: endpoint,
                    pvId,
                    myId,
                  });
                }
              },
            }
          )
          .then((res) => {
            const replyId = reply ? reply.msgId : "";
            const chatId = edit ? edit.msgId : null;
            socket.emit("uploadVoice", {
              id: res.data.id,
              path: res.data.filePath,
              sender: myId,
              receiver: pvId,
              reply: replyId,
              chatId,
            });
            setMessage("");
            setReply(null);
            setEdit(null);
            setShowEmojiPicker(false);
            if (messageRef.current) {
              messageRef.current.innerText = "";
            }
            setMessage("");
          })
          .catch(() => {});
      }
    }
  };

  async function fetchDraft() {
    try {
      const res = await http.get("/draft", { params: { pvId, myId } });
      const mes = res.data.length ? res.data[0].message : "";
      setMessage(mes);
      if (messageRef.current) {
        messageRef.current.innerText = mes;
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchDraft();
    socket.emit("getReplyMsg", { sender: myId, receiver: pvId });
    socket.emit("getEditMsg", { sender: myId, receiver: pvId });
  }, [pvId]);
  useEffect(() => {
    socket.on("draftMsg", ({ msg}) => {
      setMessage(msg);
      if (messageRef.current) {
        messageRef.current.innerText = msg;
      }
    });
    socket.on("replyMsg", (data) => {
      setEdit(null);
      setReply(data);
      if (messageRef.current) {
        messageRef.current.innerText = data.draftMsg;
      }
    });
    socket.on("editMsg", (data) => {
      setReply(null);
      setEdit(data);
      setMessage(data.draftMsg);

      if (messageRef.current) {
        messageRef.current.innerText = data.draftMsg;
      }
    });

    socket.on("deleteReplyMsg", () => {
      setReply(null);
    });
    socket.on("deleteEditMsg", () => {
      setEdit(null);
      if (messageRef.current) {
        messageRef.current.innerText = "";
      }
      setMessage("");
    });
  }, []);

  useEffect(() => {
    focusToEnd(messageRef);
  }, [edit, reply]);
  const deleteReplyHandler = (draftId: string) => {
    socket.emit("deleteReplyMsg", draftId);
  };
  const deleteEditHandler = (draftId: string) => {
    socket.emit("deleteEditMsg", draftId);
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" && event.shiftKey) {
    } else if (event.key === "Enter") {
      event.preventDefault();
      sendMsg();
      if (messageRef.current) messageRef.current.innerText = "";
    }
  };

  const handleEmojiClick = (emoji:any) => {
    if (messageRef.current) {
      const messageDiv = messageRef.current;
      messageDiv.innerText = messageDiv.innerText.concat(emoji.native);
      let newText;
      newText = messageDiv.innerText;
      setMessage(newText);
      socket.emit(`istyping`, { msg: newText, reciver: pvId, sender: myId });
    }
  };

  return (
    <div
      className={`flex items-end bg-white relative h-14 ${
        isMobileDevice() && "flex-col"
      }`}
    >
      {isMobileDevice() && (
        <div className="w-full">
          {!!reply && (
            <div className="flex justify-between w-full items-center py-1 z-10">
              <div className="flex justify-center items-center w-12">
                <HiReply size={22} className="text-red-300" />
              </div>
              <div className="flex-1 border-s-4 border-red-300 bg-[#e170761a] rounded-md p-2 pb-1 overflow-hidden">
                <div className="text-red-300 text-[14px] leading-4">
                  {reply?.username}
                </div>
                <p className="text-[12px] leading-3 pt-1 truncate laptop:w-96  tablet:w-60 mobile:w-48 ">
                  {reply?.msg}
                </p>
              </div>
              <div className="flex justify-center items-center w-12">
                <HiX
                  size={22}
                  className="cursor-pointer text-red-300"
                  onClick={() => deleteReplyHandler(reply?.draftId)}
                />
              </div>
            </div>
          )}
          {!!edit && (
            <div className="flex justify-between w-full items-center py-1 z-10">
              <div className="flex justify-center items-center w-12">
                <HiOutlinePencil size={22} className="text-red-300" />
              </div>
              <div className="flex-1 border-s-4 border-red-300 bg-[#e170761a] rounded-md p-2 pb-1 overflow-hidden">
                <div className="text-red-300 text-[14px] leading-4">
                  {t("editMessage")}
                </div>
                <p className="text-[12px] leading-3 pt-1 truncate laptop:w-96  tablet:w-60 mobile:w-48 ">
                  {edit?.msg}
                </p>
              </div>
              <div className="flex justify-center items-center w-12">
                <HiX
                  size={22}
                  className="cursor-pointer text-red-300"
                  onClick={() => deleteEditHandler(edit?.draftId)}
                />
              </div>
            </div>
          )}
        </div>
      )}
      <div className="relative flex items-end w-full">
        <div className="flex-none   w-14  h-14 p-4 bg-white text-[rgb(112,117,121)]">
          {showEmojiPicker ? (
            <FiX
              onClick={() => setShowEmojiPicker(false)}
              color="red"
              size={25}
              className="cursor-pointer"
            />
          ) : (
            <FiSmile
              size={25}
              className="cursor-pointer"
              onClick={() => setShowEmojiPicker(true)}
            />
          )}
        </div>
        <div
          className={`${
            isMobileDevice() ? "m " : ""
          }flex flex-col rounded-t-lg items-center bg-white w-[calc(100%-7rem)]`}
        >
          {!!reply && !isMobileDevice() && (
            <div className="flex justify-between w-full items-center py-1 z-10">
              <div className="flex justify-center items-center w-12">
                <HiReply size={22} className="text-red-300" />
              </div>
              <div className="flex-1 border-s-4 border-red-300 bg-[#e170761a] rounded-md p-2 pb-1 overflow-hidden">
                <div className="text-red-300 text-[14px] leading-4">
                  {reply?.username}
                </div>
                <p className="text-[12px] leading-3 pt-1 truncate laptop:w-96  tablet:w-60 mobile:w-48 ">
                  {reply?.msg}
                </p>
              </div>
              <div className="flex justify-center items-center w-12">
                <HiX
                  size={22}
                  className="cursor-pointer text-red-300"
                  onClick={() => deleteReplyHandler(reply?.draftId)}
                />
              </div>
            </div>
          )}
          {!!edit && !isMobileDevice() && (
            <div className="flex justify-between w-full items-center py-1 z-10">
              <div className="flex justify-center items-center w-12">
                <HiOutlinePencil size={22} className="text-red-300" />
              </div>
              <div className="flex-1 border-s-4 border-red-300 bg-[#e170761a] rounded-md p-2 pb-1 overflow-hidden">
                <div className="text-red-300 text-[14px] leading-4">
                  {t("editMessage")}
                </div>
                <p className="text-[12px] leading-3 pt-1 truncate laptop:w-96  tablet:w-60 mobile:w-48 ">
                  {edit?.msg}
                </p>
              </div>
              <div className="flex justify-center items-center w-12">
                <HiX
                  size={22}
                  className="cursor-pointer text-red-300"
                  onClick={() => deleteEditHandler(edit?.draftId)}
                />
              </div>
            </div>
          )}
          <div
            className="w-full max-h-52 min-h-14 overflow-y-auto outline-none p-4 animate-fade-in truncate"
            contentEditable="true"
            ref={messageRef}
            onInput={handleMessageChange}
            onKeyDown={isMobileDevice() ? () => {} : handleKeyDown}
            onFocus={() => {}}
          ></div>
        </div>
        <div className="fixed z-10">
          <div
            className={`absolute bottom-14 ${
              localStorage.getItem("selectedLanguage") == "fa"
                ? "right-4"
                : "left-4"
            }  mb-4`}
          >
            {showEmojiPicker && (
              <Picker
                data={data}
                i1
                locale={localStorage.getItem("selectedLanguage")}
                onEmojiSelect={(emoji:any) => handleEmojiClick(emoji)}
              />
            )}
          </div>
        </div>

        {!message && !edit && (
          <div className="flex-none w-14 h-14 p-4 bg-white">
            <input
              type="file"
              className="opacity-0	absolute w-7 "
              onChange={sendImage}
              onClick={(e) => ((e.target as HTMLTextAreaElement).value = "")}
              // accept="image/jpg, image/jpeg, image/png"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
            <Dialogs
              title="Size error"
              description="Your file size is too large, please use a smaller size."
              openDialog={openDialog}
              setOpenDialog={setOpenDialog}
            />
          </div>
        )}
        <div className="flex items-center justify-between w-14 h-14 p-4 bg-white">
          {(edit || !!message) && (
            <div className="w-14">
              <IoMdSend
                color="rgb(51,144,236)"
                fontSize="22px"
                className="cursor-pointer"
                onClick={sendMsg}
              />
            </div>
          )}
          {!message && !edit && (
            <div className="flex bg-white bottom-0">
              <div onClick={isRecording ? stopRecording : startRecording}>
                <span className="flex relative">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isRecording && "bg-[#74b9ff]"
                    }`}
                  ></span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-6 w-6 cursor-pointer relative inline-flex rounded-full ${
                      isRecording ? "text-blue-400" : "text-gray-400"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InputMsg;
