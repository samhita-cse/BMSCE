import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { SpotifyProvider } from "./context/SpotifyContext";
import { ThemeProvider } from "./context/ThemeContext";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <AuthProvider>
      <SpotifyProvider>
        <App />
      </SpotifyProvider>
    </AuthProvider>
  </ThemeProvider>
);
