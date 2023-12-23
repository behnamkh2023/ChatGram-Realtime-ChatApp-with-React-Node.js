import { useState } from "react";
import { FiDownload } from "react-icons/fi";

interface FileProps {
  message: {
    message: string;
    file?: {
      name: string;
      type: string;
      size: string;
    };
  };
}
export default function File({ message }: FileProps) {
  const [isHovered, setIsHovered] = useState(false);
  const downloadFile = () => {
    const link = document.createElement("a");
    link.href = message.message;
    link.download = "link";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <div className="flex mb-[-16px]" dir="ltr">
      <div className="mb-0">
        <button
          className={`flex rounded-md w-14 h-14 items-center justify-center p-1.5 bg-[#04b504] relative transition-colors ${
            isHovered ? "bg-blue-500" : ""
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {!isHovered && (
            <div
              className={`truncate font-medium text-sm text-white  ease-in-out duration-800`}
            >
              {message.file?.type}
            </div>
          )}
          <div
            className={`absolute p-3 inset-0 ${
              isHovered ? "opacity-100 scale-120" : "opacity-0"
            } transition-opacity ease-in-out duration-50`}
          >
            <FiDownload
              onClick={downloadFile}
              fontSize={30}
              className={`text-white absolute ease-in-out ml-0.5 duration-700`}
            />
          </div>
        </button>
      </div>
      <div className="my-1 mx-2 overflow-hidden">
        <div className="truncate font-medium text-md">{message.file?.name}</div>
        <div className="text-blue-500 font-medium text-sm">
          {message.file?.size}
        </div>
      </div>
    </div>
  );
}
