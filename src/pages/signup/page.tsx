import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import brasaoBrancoHorizontal from "../../assets/img/brasao-branco-horizontal.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/use-auth";

export default function Cadastro() {
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [userType, setUserType] = useState<'docente' | 'discente' | 'servidor'>('docente');
  const [area, setArea] = useState(""); // Para docentes
  const [cargo, setCargo] = useState(""); // Para servidores  
  const [curso, setCurso] = useState(""); // Para discentes
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const navigate = useNavigate();

  // Função para validar email
  const validateEmail = (email: string, userType: string) => {
    if (!email) {
      setEmailError("Email é obrigatório");
      return false;
    }
    
    if (userType === "discente") {
      if (!email.endsWith("@alu.ufc.br")) {
        setEmailError("Discentes devem usar email @alu.ufc.br");
        return false;
      }
    } else if (userType === "docente" || userType === "servidor") {
      if (!email.endsWith("@ufc.br")) {
        setEmailError("Docentes e servidores devem usar email @ufc.br");
        return false;
      }
    }
    
    setEmailError("");
    return true;
  };

  // Função para validar senhas
  const validatePasswords = (senha: string, confirmaSenha: string) => {
    if (!senha) {
      setPasswordError("Senha é obrigatória");
      return false;
    }
    
    if (senha.length < 6) {
      setPasswordError("Senha deve ter pelo menos 6 caracteres");
      return false;
    }
    
    if (senha !== confirmaSenha) {
      setPasswordError("Senhas não coincidem");
      return false;
    }
    
    setPasswordError("");
    return true;
  };

  // Validar email quando email ou userType mudarem
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    validateEmail(newEmail, userType);
  };

  // Validar senha quando confirmação mudar
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value;
    setConfirmaSenha(newConfirmPassword);
    validatePasswords(senha, newConfirmPassword);
  };

  // Validar senha quando senha principal mudar
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setSenha(newPassword);
    if (confirmaSenha) {
      validatePasswords(newPassword, confirmaSenha);
    }
  };

  // Revalidar email quando tipo de usuário mudar
  const handleUserTypeChange = (newType: 'docente' | 'discente' | 'servidor') => {
    setUserType(newType);
    if (email) {
      validateEmail(email, newType);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Validar email e senhas antes de enviar
    const isEmailValid = validateEmail(email, userType);
    const isPasswordValid = validatePasswords(senha, confirmaSenha);
    
    // Validar campos específicos
    if (userType === 'docente' && !area.trim()) {
      setError("Área de atuação é obrigatória para docentes");
      setLoading(false);
      return;
    }
    
    if (userType === 'servidor' && !cargo.trim()) {
      setError("Cargo é obrigatório para servidores");
      setLoading(false);
      return;
    }
    
    if (userType === 'discente' && !curso.trim()) {
      setError("Curso é obrigatório para discentes");
      setLoading(false);
      return;
    }
    
    if (!isEmailValid || !isPasswordValid) {
      setLoading(false);
      return;
    }
    
    try {
      const registerData = {
        name: nome,
        email: email,
        password: senha,
        type: userType as 'docente' | 'discente' | 'servidor',
        ...(userType === 'docente' && { area }),
        ...(userType === 'servidor' && { cargo }),
        ...(userType === 'discente' && { curso })
      };
      
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
                onChange={() => handleUserTypeChange('docente')}
                className="w-4 h-4 text-blue-700"
              />
              <span className="text-sm font-medium text-gray-800">
                Docente*
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="userType"
                value="servidor"
                checked={userType === 'servidor'}
                onChange={() => handleUserTypeChange('servidor')}
                className="w-4 h-4 text-blue-700"
              />
              <span className="text-sm font-medium text-gray-800">
                Servidor*
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="userType"
                value="discente"
                checked={userType === 'discente'}
                onChange={() => handleUserTypeChange('discente')}
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
                type="email"
                placeholder="Digite seu E-mail Institucional"
                value={email}
                onChange={handleEmailChange}
                className={`rounded-full border-gray-300 px-5 py-5 ${emailError ? 'border-red-500' : ''}`}
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-1 ml-2">{emailError}</p>
              )}
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

            {/* Campos específicos por tipo de usuário */}
            {userType === 'docente' && (
              <div>
                <Label className="text-blue-900 font-medium">
                  Área de Atuação*
                </Label>
                <Input
                  placeholder="Ex: Engenharia de Software, Matemática, etc."
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="rounded-full border-gray-300 px-5 py-5"
                  required
                />
              </div>
            )}

            {userType === 'servidor' && (
              <div>
                <Label className="text-blue-900 font-medium">
                  Cargo*
                </Label>
                <Input
                  placeholder="Ex: Técnico Administrativo, Analista, etc."
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  className="rounded-full border-gray-300 px-5 py-5"
                  required
                />
              </div>
            )}

            {userType === 'discente' && (
              <div>
                <Label className="text-blue-900 font-medium">
                  Curso*
                </Label>
                <div className="flex flex-col gap-3 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="curso"
                      value="Análise e Desenvolvimento de Sistemas"
                      checked={curso === 'Análise e Desenvolvimento de Sistemas'}
                      onChange={(e) => setCurso(e.target.value)}
                      className="w-4 h-4 text-blue-700"
                    />
                    <span className="text-sm font-medium text-gray-800">
                      Análise e Desenvolvimento de Sistemas
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="curso"
                      value="Ciência de Dados"
                      checked={curso === 'Ciência de Dados'}
                      onChange={(e) => setCurso(e.target.value)}
                      className="w-4 h-4 text-blue-700"
                    />
                    <span className="text-sm font-medium text-gray-800">
                      Ciência de Dados
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="curso"
                      value="Segurança da Informação"
                      checked={curso === 'Segurança da Informação'}
                      onChange={(e) => setCurso(e.target.value)}
                      className="w-4 h-4 text-blue-700"
                    />
                    <span className="text-sm font-medium text-gray-800">
                      Segurança da Informação
                    </span>
                  </label>
                </div>
              </div>
            )}

            <div>
              <Label className="text-blue-900 font-medium">Senha*</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={handlePasswordChange}
                  className={`rounded-full border-gray-300 px-5 py-5 pr-12 ${passwordError ? 'border-red-500' : ''}`}
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

            <div>
              <Label className="text-blue-900 font-medium">Confirmar Senha*</Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirme sua senha"
                  value={confirmaSenha}
                  onChange={handleConfirmPasswordChange}
                  className={`rounded-full border-gray-300 px-5 py-5 pr-12 ${passwordError ? 'border-red-500' : ''}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-0 h-6 w-6"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-500" />
                  )}
                </Button>
              </div>
              {passwordError && (
                <p className="text-red-500 text-sm mt-1 ml-2">{passwordError}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <Button 
            type="submit"
            disabled={loading}
            className="w-full rounded-full py-6 bg-[#003366] hover:bg-[#002855] text-white font-semibold disabled:opacity-50"
          >
            {loading ? "Cadastrando..." : "Cadastre-se"}
          </Button>

          {/* Botões de navegação */}
          <div className="flex flex-col gap-3 mt-6">
            <Button 
              type="button"
              variant="outline"
              onClick={() => navigate("/login")}
              className="w-full py-6 border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              Já tem conta? Faça login
            </Button>
            
            <Button 
              type="button"
              variant="ghost"
              onClick={() => navigate("/")}
              className="w-full py-6 text-gray-600 hover:bg-gray-50"
            >
              Voltar para Home
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}