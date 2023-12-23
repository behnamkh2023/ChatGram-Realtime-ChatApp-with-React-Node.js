import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { t } from "i18next";

import Messages from "./ChatMessages";
import { getUserPv } from "../chatSlice";
import InputMsg from "./InputMsg";
import { AppDispatch, RootState } from "../../../redux/store";
import Header from "./Header";

export default function Pv() {
  const { id: pvId } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const {
    login: {
      data: { _id: myId },
    },
    userPv: { pv, loading },
  } = useSelector((state: RootState) => state);

  useEffect(() => {
    if (pvId) {
      dispatch(getUserPv({ myId, pvId }));
    }
  }, [pvId]);

  return (
    <>
      {!loading && pv._id ? (
        <div>
          <Header pv={pv} pvId={pvId} />
          <div className="min-h-[calc(100vh-112px)]">
            {pv?._id == pvId ? <Messages /> : ""}
          </div>
          <InputMsg />
        </div>
      ) : (
        <div className="flex h-screen items-center justify-center">
          <p className="p-4 inline-flex flex-col items-center bg-[#248da287] min-w-fit rounded-lg text-white">
            {loading ? t("loading...") : t("notFound")}
          </p>
        </div>
      )}
    </>
  );
}
