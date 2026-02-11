import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import ChatWindow from "../../components/chat/ChatWindow";

export default function ChatLayout() {
  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#f5f5f5" }}>
      <Sidebar />
      <ChatWindow />
    </Box>
  );
}
