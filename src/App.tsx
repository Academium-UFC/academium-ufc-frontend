import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/sign-in/page";
import SignUpPage from "./pages/signup/page";
import Home from "./pages/home/page";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<SignUpPage />} />
      </Routes>
    </BrowserRouter>
  );
}