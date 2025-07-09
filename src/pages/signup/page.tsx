import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import brasaoBrancoHorizontal from "../../assets/img/brasao-branco-horizontal.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/use-auth";

interface RegisterData {
  name: string;
  email: string;
  password: string;
  type: string;
  education?: string;
  course?: string;
  area?: string;
}

export default function Cadastro() {
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [userType, setUserType] = useState("docente");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const registerData: RegisterData = {
        name: nome,
        email,
        password: senha,
        type: userType
      };
      if (userType === 'docente') {
        // Assuming education is not directly managed by state in this component
        // registerData.education = education; 
      } else if (userType === 'discente') {
        // Assuming course is not directly managed by state in this component
        // registerData.course = course; 
      } else if (userType === 'servidor') {
        // Assuming area is not directly managed by state in this component
        // registerData.area = area; 
      }
      await register(registerData);
      navigate("/login");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao fazer cadastro";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-[#002c59] text-white flex-col items-center justify-between py-10 relative">
        <img src={brasaoBrancoHorizontal} alt="Logo UFC" className="w-60" />

        <div className="space-y-10">
          <div className="w-60 h-60 bg-blue-400/20 rounded-full flex items-center justify-center">
            <div className="w-20 h-20 bg-white rounded-full"></div>
          </div>
          <div className="w-60 h-60 bg-blue-400/20 rounded-full flex items-center justify-center">
            <div className="w-20 h-20 bg-white rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative overflow-hidden bg-white">
        <div className="absolute right-10 top-10 flex gap-4 z-0">
          <div className="w-8 h-8 bg-blue-200 rounded-full"></div>
          <div className="w-4 h-4 bg-blue-100 rounded-full mt-6"></div>
          <div className="w-6 h-6 bg-blue-300 rounded-full"></div>
        </div>

        <form className="w-full max-w-md space-y-6 z-10" onSubmit={handleSubmit}>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">Vitrine</h1>
            <h2 className="text-xl font-semibold text-gray-600">
              UFC - ITAPAJÉ
            </h2>
          </div>

          <div className="flex items-center justify-center gap-8">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="userType"
                value="docente"
                checked={userType === 'docente'}
                onChange={() => setUserType('docente')}
                className="w-4 h-4 text-blue-700"
              />
              <span className="text-sm font-medium text-gray-800">
                Docente/Servidor*
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="userType"
                value="discente"
                checked={userType === 'discente'}
                onChange={() => setUserType('discente')}
                className="w-4 h-4 text-blue-700"
              />
              <span className="text-sm font-medium text-gray-800">
                Discente*
              </span>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-blue-900 font-medium">
                Nome e Sobrenome
              </Label>
              <Input
                placeholder="Digite seu nome e sobrenome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="rounded-full border-gray-300 px-5 py-5"
              />
            </div>

            <div>
              <Label className="text-blue-900 font-medium">
                E-mail Institucional
              </Label>
              <Input
                placeholder="Digite seu E-mail Institucional"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-full border-gray-300 px-5 py-5"
              />
            </div>

            <div>
              <Label className="text-blue-900 font-medium">
                Identificação (matricula/siape)
              </Label>
              <Input
                placeholder="Digite sua matrícula / siape"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                className="rounded-full border-gray-300 px-5 py-5"
              />
            </div>

            <div>
              <Label className="text-blue-900 font-medium">Senha*</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="rounded-full border-gray-300 px-5 py-5 pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-0 h-6 w-6"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <Button className="w-full rounded-full py-6 bg-[#003366] hover:bg-[#002855] text-white font-semibold">
            Cadastre - se
          </Button>
        </form>
      </div>
    </div>
  );
}