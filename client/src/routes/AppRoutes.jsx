import { createBrowserRouter } from "react-router-dom";

import Login from "../pages/Login.jsx";
import Customers from "../pages/Customers.jsx";
import SendMail from "../pages/SendMail.jsx";
import MailHistory from "../pages/MailHistory.jsx";
import TemplateList from "../pages/TemplateList.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";
import ImageFolders from "../pages/ImageFolders.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    element: <AdminLayout />,
    children: [
      {
        path: "/customers",
        element: <Customers />,
      },
      {
        path: "/send-mail",
        element: <SendMail />,
      },
      {
        path: "/image-folders", 
        element: <ImageFolders />,
      },
      {
        path: "/mail-history",
        element: <MailHistory />,
      },
      {
        path: "/template",
        element: <TemplateList />,
      },
    ],
  },
]);

export default router;
