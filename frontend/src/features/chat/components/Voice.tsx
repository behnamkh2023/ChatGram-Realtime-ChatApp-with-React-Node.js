import { useState, useRef } from "react";
import { BsPlayFill, BsPauseFill } from "react-icons/bs";
import moment from "moment";
import type { Message } from "../types";

export default function Voice({ message }:{message:Message}) {
  const [voice, _setVoice] = useState<HTMLAudioElement>(new Audio(message.message));
  const [duration, setDuration] = useState<unknown>("0.00");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const refWidth = useRef<HTMLDivElement>(null);
    voice.addEventListener("ended", () => setIsPlaying(isPlaying));

  voice.addEventListener("timeupdate", function () {
    var duration = this.duration;
    var currentTime = this.currentTime;
    var percentage = (currentTime / duration) * 100;
    if (refWidth.current) {
      refWidth.current.style.width = percentage + "%";
    }
    setDuration(currentTime);
  });
  const playPause = () => {
    if (isPlaying) {
      voice.pause();
    } else {
      voice.play();
    }
    setIsPlaying(!isPlaying);
  };
  return (
    <div className="flex mb-[-16px]" dir="ltr">
      <div className=" ">
        <button className="flex rounded-full w-12 h-12  p-1.5 bg-[#04b504]">
          <BsPlayFill
            onClick={playPause}
            fontSize={36}
            className={`text-white absolute ease-in-out ml-0.5		duration-700 	z-0	 ${
              isPlaying ? "opacity-0 scale-50" : " z-10"
            }`}
          />
          <BsPauseFill
            onClick={playPause}
            fontSize={36}
            className={`text-white absolute ease-in-out	 	duration-700 z-0 ${
              isPlaying ? " z-10" : "opacity-0 scale-50"
            }`}
          />
        </button>
      </div>
      <div className="min-w-[100px] w-full	flex flex-col justify-between ml-2">
        <div className="bg-green-200 h-1 mt-2 rounded-full">
          <div
            className="bg-green-900 w-0 h-1 rounded-full"
            ref={refWidth}
          ></div>
        </div>
        <div className="text-sm text-start">
          {moment.utc(duration as number * 1000).format("m:ss")}
        </div>
      </div>
    </div>
  );
}
