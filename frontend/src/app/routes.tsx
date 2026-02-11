import { createBrowserRouter } from "react-router-dom";
import ChatPage from "../pages/chat/ChatPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <ChatPage />,
  },
]);
