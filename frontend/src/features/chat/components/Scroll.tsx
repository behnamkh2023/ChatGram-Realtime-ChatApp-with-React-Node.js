import { useEffect, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

import socket from "../../../services/ws";
import type { NewMsgs } from "../types";


type ScrollProps={
  id :string | undefined,
  bottomRef:React.RefObject<HTMLDivElement>,
  newMsgs: NewMsgs
  
}
export default function Scroll({ id ,bottomRef,newMsgs }:ScrollProps) {
  const [num, setNum] = useState(0);
  const onScrollBtn = () => {
         if (bottomRef.current) {
          (bottomRef.current as unknown as HTMLElement).scrollIntoView({ behavior: "smooth" });
        }
        socket.emit("seen", {
        sender:id,
        receiver:localStorage.getItem('userId') ,
      });
      setNum(0);
  };
  useEffect(() => {
    socket.on(`info-user${id}`, (info) => {
      setNum(info.length);
    });
    newMsgs.index && setNum(newMsgs.index)
  },[]);
  if (num > 0) {
    return (
        <div className="absolute bottom-24 ltr:right-12 rtl:left-12 flex flex-col items-center">
        <div className="text-center text-sm text-white relative top-3 max-w-max py-0.5 px-2  bg-blue-400  b-2  z-10 rounded-full">
          {num}
        </div>
        <div
          className=" p-3 bg-white  rounded-full cursor-pointer"
          onClick={onScrollBtn}
        >
          {<FiChevronDown fontSize={22} />}
        </div>
      </div>
    );
  }
}
