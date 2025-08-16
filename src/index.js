import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { BackgroundProvider } from "./context/BackgroundContext"; 

ReactDOM.render(
  <React.StrictMode>
  <BackgroundProvider>
    <App />
  </BackgroundProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

