import { useEffect, useState } from "react";
import { useParams, useNavigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiSettings, FiMessageSquare } from "react-icons/fi";

import Users from "../features/chat/components/Users";
import Settings from "../features/settings/components/Settings";
import avatar from "../assets/user.jpg";
import Loading from "../components/Loading";
import { RootState } from "../redux/store";

function Dashboard() {
  const [statusNav, setStatusNav] = useState("chat");
  const [showPv, setShowPv] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const {
    login: { loading, data, login, status },
  } = useSelector((state: RootState) => state);
  const { id } = useParams();
  const navigate = useNavigate();

  window.addEventListener("online", () => {
    setOnline(true);
  });
  window.addEventListener("offline", () => {
    setOnline(false);
  });

  const navClick = (name: string) => {
    setStatusNav(name);
  };
  useEffect(() => {
    id == undefined ? setShowPv(false) : setShowPv(true);
  }, [id]);
  if (loading) return <Loading />;

  if (!login && status == 1) {
    navigate("/login", { replace: true });
  }
  const project = (projectName: string) => {
    switch (projectName) {
      case "chat":
        return <Users />;
      case "settings":
        return <Settings />;
      default:
        return <h5>not found</h5>;
    }
  };

  if (login && status == 1) {
    return (
      <div className="flex flex-col min-h-screen ltr:divide-x divide-[rgb(218,220,224)] laptop:flex-row">
        <div
          className={`laptop:flex flex-col min-h-screen rtl:border-e-[1px] ltr:divide-x divide-[rgb(218,220,224)] laptop:flex-row 
          ${showPv && "hidden"}`}
        >
          <div className="flex flex-row flex-initial rtl:border-e-[1px] divide-y-reverse w-full justify-around items-center laptop:flex-col laptop:w-16 mobile:shadow-md laptop:shadow-none  laptop:justify-between">
            <div className="flex flex-row flex-initial w-full justify-around items-center laptop:flex-col">
              <div
                className={`cursor-pointer p-6 hover:text-blue-500 ${
                  statusNav == "chat"
                    ? "text-blue-500 border-b-4	border-blue-500"
                    : ""
                } md:border-b-0`}
                onClick={() => navClick("chat")}
              >
                <FiMessageSquare size="28px" />
              </div>
              <div
                className={`cursor-pointer p-6 hover:text-blue-500 ${
                  statusNav == "settings"
                    ? "text-blue-500 border-b-4	border-blue-500"
                    : ""
                } md:border-b-0`}
                onClick={() => navClick("settings")}
              >
                <FiSettings size="28px" />
              </div>
            </div>
            <div className="hidden laptop:flex">
              <div className="Avatar flex-none w-10 h-10 me-3 rounded-full bg-blue-grey-50 relative m-2 mt-4">
                <img
                  className="rounded-full w-full h-full"
                  src={data?.avatar ?? avatar}
                />
                {online && (
                  <span className="w-2 h-2 border-white border-2 bg-[#00d000] absolute right-0 rounded-full bottom-1"></span>
                )}
              </div>
            </div>
          </div>
          <div className="bg-grey-100 min-h-screen mobile:w-full laptop:w-96">
            {" "}
            {project(statusNav)}
          </div>
        </div>
        <div
          className={`flex-1 flex-col bg-[url('assets/chat-bg-pattern-light.png')] bg-fixed bg-[#90cbd599] bg-contain laptop:flex justify-between 
          ${!showPv && "hidden"}`}
        >
          <Outlet />
        </div>
      </div>
    );
  }
}

export default Dashboard;
