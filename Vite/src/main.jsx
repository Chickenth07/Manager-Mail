import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { PrimeReactProvider } from "primereact/api";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
<PrimeReactProvider>
  <BrowserRouter>
    <App />
  </BrowserRouter>
</PrimeReactProvider>
);
