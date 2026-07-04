import React from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";
import { BrowserRouter } from "react-router-dom";
import App from "./app";
import "./styles.css";

axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
