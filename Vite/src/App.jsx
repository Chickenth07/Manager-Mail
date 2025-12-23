import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Customers from "./pages/Customers";
import SendEmail from "./pages/SendEmail";
import MainLayout from "./layout/MainLayout";

const isLoggedIn = () => localStorage.getItem("isLoggedIn") === "true";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={isLoggedIn() ? <MainLayout /> : <Navigate to="/login" />}
      >
        <Route path="customers" element={<Customers />} />
        <Route path="email" element={<SendEmail />} />
      </Route>
    </Routes>
  );
}

export default App;
