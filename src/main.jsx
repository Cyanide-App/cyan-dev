jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import Games from "./Games.jsx";
import Chat from "./Chat.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Search from "./Search.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "games",
    element: <Games />,
  },
  {
    path: "chat",
    element: <Chat />,
  },
  {
    path: "search", // New route for search results
    element: <Search />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
