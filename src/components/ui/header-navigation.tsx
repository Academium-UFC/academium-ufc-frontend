import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/use-auth";
import { UserMenu } from "@/components/ui/user-menu";
import brasaoBrancoHorizontal from "../../assets/img/brasao-branco-horizontal.png";

interface HeaderNavigationProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backPath?: string;
  backLabel?: string;
  showHomeButton?: boolean;
  className?: string;
}

export default function HeaderNavigation({
  title,
  subtitle,
  showBackButton = true,
  backPath = "/",
  backLabel = "Voltar",
  showHomeButton = false,
  className = "bg-[#003366]"
}: HeaderNavigationProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  return (
    <header className={`${className} text-white shadow-lg`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <img
              src={brasaoBrancoHorizontal}
              className="h-12 w-24 object-contain cursor-pointer"
              alt="Logo UFC"
              onClick={() => navigate("/")}
            />
            {title && (
              <div>
                <h1 className="text-xl font-bold">{title}</h1>
                {subtitle && <p className="text-sm text-blue-200">{subtitle}</p>}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {showBackButton && (
              <Button
                variant="ghost"
                onClick={() => navigate(backPath)}
                className="text-white hover:bg-blue-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {backLabel}
              </Button>
            )}
            
            {showHomeButton && (
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="text-white hover:bg-blue-800"
              >
                <Home className="w-4 h-4 mr-2" />
                Início
              </Button>
            )}

            {/* Navegação para usuários autenticados */}
            {isAuthenticated && user && (
              <nav className="hidden md:flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/projetos")} 
                  className="text-white hover:bg-blue-800"
                >
                  Projetos
                </Button>
                
                {user.type === 'admin' && (
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate("/admin")} 
                    className="text-white hover:bg-blue-800"
                  >
                    Admin
                  </Button>
                )}
                
                {user.coordenador_institucional?.ativo && (
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate("/coordenador")} 
                    className="text-white hover:bg-blue-800"
                  >
                    Coordenação
                  </Button>
                )}
                
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/perfil")} 
                  className="text-white hover:bg-blue-800"
                >
                  Perfil
                </Button>
              </nav>
            )}

            {/* Menu do usuário ou botões de login/cadastro */}
            {isAuthenticated && user ? (
              <UserMenu />
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate("/login")} 
                  className="bg-white text-[#003366] hover:bg-gray-100"
                >
                  Login
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate("/cadastro")} 
                  className="bg-white text-[#003366] hover:bg-gray-100"
                >
                  Cadastrar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
