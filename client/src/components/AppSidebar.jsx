import { Sidebar } from "primereact/sidebar";
import { PanelMenu } from "primereact/panelmenu";
import { useNavigate, useLocation } from "react-router-dom";

export default function AppSidebar({ visible, onHide }) {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    {
      label: "Menu",
      items: [
        {
          label: "Khách hàng",
          icon: "pi pi-users",
          className: location.pathname === "/customers" ? "text-primary" : "",
          command: () => {
            navigate("/customers");
            onHide();
          },
        },
        {
          label: "Gửi Mail",
          icon: "pi pi-envelope",
          className: location.pathname === "/send-mail" ? "text-primary" : "",
          command: () => {
            navigate("/send-mail");
            onHide();
          },
        },
      ],
    },
  ];

  return (
    <Sidebar visible={visible} onHide={onHide}>
      <PanelMenu model={items} className="w-full" />
    </Sidebar>
  );
}
