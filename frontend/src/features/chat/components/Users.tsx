import React, { useEffect, useState } from "react";
import { Input } from "@material-tailwind/react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

import { getAllUsers } from "../../authentication/authSlice";
import UserList from "./UserList";
import socket from "../../../services/ws";
import type { AppDispatch, RootState } from "../../../redux/store";
import type { User } from "../types";


export default function Users() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { users, data } = useSelector((state: RootState) => state.login);
  const [search, setSearch] = useState("");
  
  socket.on("connect", () => {
    socket.emit("active-user", { userId: data._id });
  });

  socket.on("disconnect", () => {});



  const userList = users.filter((user: User) => {
    return (
      user._id != data._id &&
      user.isActive == true &&
      user.username.toLowerCase().indexOf(search.toLowerCase()) > -1
    );
  });

  useEffect(() => {
    dispatch(getAllUsers());
  }, []);

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0.6 }}
      animate={{
        transform: "scale(1)",
        opacity: 1,
        transition: { duration: 0.2, ease: "easeInOut" },
      }}
    >
      <div className="m-4 pt-2">
        <Input
          color="light-blue"
          label={t("search")}
          onChange={onSearch}
          crossOrigin="anonymous"
        />
      </div>
      <div className="overflow-x-hidden overflow-y-auto h-[calc(100vh-96px)] overflow-auto p-4">
        {userList.map((user:User) => (
          <UserList
            key={user._id}
            item={user}
            me={data._id}
          />
        ))}
      </div>
    </motion.div>
  );
}
