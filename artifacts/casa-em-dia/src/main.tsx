import { createRoot } from "react-dom/client";
import Clarity from "@microsoft/clarity";
import App from "./App";
import "./index.css";

Clarity.init("wfivq7r4yy");

createRoot(document.getElementById("root")!).render(<App />);
