import { io } from "socket.io-client";

const ws = io(`${import.meta.env.VITE_SERVER_URL}/?userId=${localStorage.getItem("userId")}`);
export default ws;