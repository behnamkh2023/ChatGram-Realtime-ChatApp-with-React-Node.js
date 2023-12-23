import { useState, useEffect, useRef } from "react";

import socket from "../../../services/ws";

type uploadData = {
  progress: number;
  type: string;
  pvId: string;
  myId: string;
};
function Uploading() {
  const [data, setData] = useState<uploadData | null>(null);
  const uploadRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (uploadRef.current) {
        uploadRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [data]);
  useEffect(() => {
    socket.on("uploadPercentage", ({ progress, type, pvId, myId }) => {
      setData({ progress: Math.round(progress), type, pvId, myId });
    });
  }, []);

  return (
    <>
      {data != null && data.progress > 0 && data.progress < 100 && (
        <div className="">
          <div className="py-4">
            <div className="text-center text-xs">{`${data.progress}%`}</div>
            <div className="bg-gray-100 h-2 w-72 rounded-full  mx-auto">
              <div
                className="bg-blue-500 h-2 rounded-full"
                ref={uploadRef}
                style={{ width: `${data.progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Uploading;
