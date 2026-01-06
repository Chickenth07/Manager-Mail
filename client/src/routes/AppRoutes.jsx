import { createBrowserRouter } from "react-router-dom";
import Customers from "../pages/Customers.jsx";
import Login from "../pages/Login.jsx";
import SendMail from "../pages/SendMail.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/customers",
    element: <Customers />,
  },
  {
    path: "/send-mail",
    element: <SendMail/>,
  },
]);

export default router;
