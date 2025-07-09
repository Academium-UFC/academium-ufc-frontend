import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/use-auth";
import type { RegisterData } from "@/lib/api";
import brasaoBrancoHorizontal from "../../assets/img/brasao-branco-horizontal.png";

export default function Cadastro() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<'docente' | 'servidor' | 'discente'>('docente');
  const [education, setEducation] = useState("");
  const [course, setCourse] = useState("");
  const [area, setArea] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const registerData: RegisterData = {
        name,
        email,
        password,
        type: userType
      };

      if (userType === 'docente') {
        registerData.education = education;
      } else if (userType === 'discente') {
        registerData.course = course;
      } else if (userType === 'servidor') {
        registerData.area = area;
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

        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6 z-10">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">Vitrine</h1>
            <h2 className="text-xl font-semibold text-gray-600">
              UFC - ITAPAJÉ
            </h2>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-center gap-8">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="userType"
                value="docente"
                checked={userType === 'docente'}
                onChange={(e) => setUserType(e.target.value as 'docente')}
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
                onChange={(e) => setUserType(e.target.value as 'discente')}
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
                Nome e Sobrenome*
              </Label>
              <Input
                placeholder="Digite seu nome e sobrenome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-full border-gray-300 px-5 py-5"
                required
              />
            </div>

            <div>
              <Label className="text-blue-900 font-medium">
                E-mail Institucional*
              </Label>
              <Input
                type="email"
                placeholder="Digite seu E-mail Institucional"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-full border-gray-300 px-5 py-5"
                required
              />
            </div>

            {/* Campo específico baseado no tipo de usuário */}
            {userType === 'docente' && (
              <div>
                <Label className="text-blue-900 font-medium">
                  Formação/Educação
                </Label>
                <Input
                  placeholder="Digite sua formação (ex: Doutorado em Computação)"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="rounded-full border-gray-300 px-5 py-5"
                />
              </div>
            )}

            {userType === 'discente' && (
              <div>
                <Label className="text-blue-900 font-medium">
                  Curso
                </Label>
                <Input
                  placeholder="Digite seu curso (ex: Ciência da Computação)"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="rounded-full border-gray-300 px-5 py-5"
                />
              </div>
            )}

            {userType === 'servidor' && (
              <div>
                <Label className="text-blue-900 font-medium">
                  Área de Atuação
                </Label>
                <Input
                  placeholder="Digite sua área de atuação"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="rounded-full border-gray-300 px-5 py-5"
                />
              </div>
            )}

            <div>
              <Label className="text-blue-900 font-medium">Senha*</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha (mínimo 8 caracteres)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-full border-gray-300 px-5 py-5 pr-12"
                  minLength={8}
                  required
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
          
          <Button 
            type="submit"
            disabled={loading}
            className="w-full rounded-full py-6 bg-[#003366] hover:bg-[#002855] text-white font-semibold disabled:opacity-50"
          >
            {loading ? "Cadastrando..." : "Cadastre-se"}
          </Button>

          <div className="text-center">
            <span className="text-gray-600">Já tem uma conta? </span>
            <button 
              type="button"
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:underline font-medium"
            >
              Faça login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}