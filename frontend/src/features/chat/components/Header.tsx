import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Istyping from "./Istyping";
import avatar from "../../../assets/user.jpg";

export default function Header({
  pv,
  pvId,
}: {
  pv: Record<string, any>;
  pvId: string | undefined;
}) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="mainHeader flex shadow-md bg-white z-10">
      <div className="header-info flex flex-1 items-center px-4 pt-2 pb-2">
        <div
          className="ltr:pr-2 rtl:pl-2 laptop:hidden cursor-pointer"
          onClick={() => navigate("/")}
        >
          {i18n.dir() == "ltr" ? (
            <FiArrowLeft fontSize={24} />
          ) : (
            <FiArrowRight fontSize={24} />
          )}
        </div>
        <div className="Avatar w-10 h-10 me-3 rounded-full bg-blue-grey-50">
          <img
            className="rounded-full w-full h-full"
            src={pv?.avatar ?? avatar}
          />
        </div>
        <div className="leading-5">
          <div className="">
            <h2 className="truncate">
              <b>{pv.username}</b>
            </h2>
          </div>
          <div className="truncate text-sm text-[rgb(112,117,121)]">
            {pv?._id == pvId && pvId != undefined ? <Istyping pvId={pvId} /> : ""}
          </div>
        </div>
      </div>
      <div className="header-tools flex items-center"></div>
    </div>
  );
}
