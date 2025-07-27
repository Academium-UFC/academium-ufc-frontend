import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/sign-in/page";
import SignUpPage from "./pages/signup/page";
import Home from "./pages/home/page";
import Projects from "./pages/projects/page";
import DetailsProjects from "./pages/detailsProjects/page";
import AdminPage from "./pages/admin/page";
import ProfilePage from "./pages/profile/page";
import PublicProfilePage from "./pages/profile/public";
import ProfilesDirectoryPage from "./pages/profiles/directory";
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
          <Route path="/projetos/:id" element={<DetailsProjects />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/profile/public/:id" element={<PublicProfilePage />} />
          <Route path="/perfil-publico/:id" element={<PublicProfilePage />} />
          <Route path="/perfis" element={<ProfilesDirectoryPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}