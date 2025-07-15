import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/sign-in/page";
import SignUpPage from "./pages/signup/page";
import Home from "./pages/home/page";
import Projects from "./pages/navbar/projects";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<SignUpPage />} />
        <Route path="projetos" element={<Projects/>}/>
      </Routes>
    </BrowserRouter>
  );
}