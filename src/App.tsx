import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/sign-in/page";
import SignUpPage from "./pages/signup/page";
import Home from "./pages/home/page";
import Projects from "./pages/projects/page";
import { AuthProvider } from "@/lib/auth-context";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<SignUpPage />} />
          <Route path="/projetos" element={<Projects />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}