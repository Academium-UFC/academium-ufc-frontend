import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import brasaoBrancoHorizontal from "../../assets/img/brasao-branco-horizontal.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/use-auth";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/projetos");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao fazer login";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400/30 rounded-full"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-blue-300/20 rounded-full"></div>
          <div className="absolute bottom-32 left-16 w-40 h-40 bg-blue-400/25 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 bg-blue-300/30 rounded-full"></div>
        </div>

        <img
          src={brasaoBrancoHorizontal}
          className="h-28 w-56 object-contain ml-10 "
          alt="Logo UFC"
        />

        {/* Illustrations */}
        <div className="flex flex-col justify-center items-center w-full relative z-10">
          {/* Person with laptop illustration */}
          <div className="mb-16 relative">
            <div className="w-48 h-48 bg-blue-300/40 rounded-full flex items-center justify-center">
              <div className="w-16 h-12 bg-white rounded-lg shadow-lg transform -rotate-12">
                <div className="w-full h-2 bg-blue-500 rounded-t-lg"></div>
                <div className="p-2">
                  <div className="w-8 h-1 bg-gray-300 rounded mb-1"></div>
                  <div className="w-6 h-1 bg-gray-300 rounded"></div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Person with mobile device */}
          <div className="mb-16 relative -ml-20">
            <div className="w-40 h-40 bg-blue-400/30 rounded-full flex items-center justify-center">
              <div className="w-8 h-12 bg-white rounded-lg shadow-lg">
                <div className="w-full h-2 bg-blue-500 rounded-t-lg"></div>
                <div className="p-1">
                  <div className="w-4 h-1 bg-gray-300 rounded mb-1"></div>
                  <div className="w-3 h-1 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative -mr-16">
            <div className="w-44 h-44 bg-blue-300/35 rounded-full flex items-center justify-center">
              <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                </div>
              </div>
              <div className="absolute top-4 right-4 w-3 h-3 bg-white rounded-full"></div>
              <div className="absolute bottom-6 left-6 w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-16 right-20 w-20 h-20 bg-blue-100 rounded-full"></div>
          <div className="absolute top-32 right-8 w-12 h-12 bg-blue-200 rounded-full"></div>
          <div className="absolute top-8 right-32 w-8 h-8 bg-blue-150 rounded-full"></div>
          <div className="absolute bottom-20 right-16 w-16 h-16 bg-blue-100 rounded-full"></div>
          <div className="absolute bottom-32 right-32 w-6 h-6 bg-blue-200 rounded-full"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8"></div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Vitrine</h1>
              <h2 className="text-xl font-semibold text-gray-600">
                UFC - ITAPAJÉ
              </h2>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-600 font-medium">
                  E-mail Institucional*
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu e-mail institucional"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="py-6 border-gray-300 focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha" className="text-gray-600 font-medium">
                  Senha*
                </Label>
                <div className="relative">
                  <Input
                    id="senha"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="py-6 pr-12 border-gray-300 focus:border-blue-500"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="text-right">
                <button className="text-sm text-blue-600 hover:underline">
                  Forgot your Password?
                </button>
              </div>

              <Button type="submit" disabled={loading} className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50">
                {loading ? "Entrando..." : "Login"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}