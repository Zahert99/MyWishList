import { BrowserRouter } from "react-router-dom";
import Router from "./router/Router.js";
import { ThemeProvider } from "./context/ThemContext.tsx";
import "./styles/themes.css";
import "./App.css";
import useAuth from "./context/useAuth.js";
import { Suspense } from "react";

function App() {
  const { user, login, logout } = useAuth();

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Suspense fallback={<h3>Laddar...</h3>}>
          <Router user={user} onLogout={logout} onLogin={login} />
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
