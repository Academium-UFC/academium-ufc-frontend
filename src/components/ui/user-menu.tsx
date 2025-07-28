import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/use-auth";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Settings, 
  BookOpen, 
  Shield, 
  LogOut, 
  UserCog,
  Users,
  Plus,
  FileText,
  Crown
} from "lucide-react";
import { UserAvatar } from "./user-avatar";

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const menuItems = [
    // Itens comuns para todos os usuários
    {
      icon: User,
      label: "Meu Perfil",
      action: () => navigate("/perfil"),
      show: true,
    },
    {
      icon: FileText,
      label: "Ver Perfil Público",
      action: () => navigate(`/perfil-publico/${user.id}`),
      show: true,
    },
    {
      icon: Settings,
      label: "Editar Perfil",
      action: () => navigate("/perfil?edit=true"),
      show: true,
    },
    
    // Itens para docentes e servidores
    {
      icon: BookOpen,
      label: "Meus Projetos",
      action: () => navigate("/perfil#projetos"),
      show: user.type === 'docente' || user.type === 'servidor' || user.type === 'admin',
    },
    {
      icon: Plus,
      label: "Criar Projeto",
      action: () => navigate("/perfil?action=create-project"),
      show: user.type === 'docente' || user.type === 'servidor' || user.type === 'admin',
    },
    
    // Itens específicos para coordenadores institucionais
    {
      icon: Crown,
      label: "Painel Coordenador",
      action: () => navigate("/coordenador"),
      show: !!user.coordenador_institucional?.ativo,
    },
    
    // Itens específicos para admin
    {
      icon: Shield,
      label: "Painel Admin",
      action: () => navigate("/admin"),
      show: user.type === 'admin',
    },
    {
      icon: Users,
      label: "Gerenciar Usuários",
      action: () => navigate("/admin#usuarios"),
      show: user.type === 'admin',
    },
    {
      icon: FileText,
      label: "Aprovar Projetos",
      action: () => navigate("/admin#projetos"),
      show: user.type === 'admin',
    },
    
    // Itens específicos para discentes
    {
      icon: BookOpen,
      label: "Projetos Participando",
      action: () => navigate("/perfil#colaboracoes"),
      show: user.type === 'discente',
    },
    {
      icon: Users,
      label: "Buscar Projetos",
      action: () => navigate("/projetos"),
      show: user.type === 'discente',
    },
  ];

  const visibleItems = menuItems.filter(item => item.show);

  const getUserTypeLabel = () => {
    switch (user.type) {
      case 'admin': return 'Administrador';
      case 'docente': return 'Docente';
      case 'servidor': return 'Servidor';
      case 'discente': return 'Discente';
      default: return user.type;
    }
  };

  const getUserTypeIcon = () => {
    switch (user.type) {
      case 'admin': return Crown;
      case 'docente': return UserCog;
      case 'servidor': return Settings;
      case 'discente': return User;
      default: return User;
    }
  };

  const TypeIcon = getUserTypeIcon();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative flex items-center space-x-2 text-white hover:text-gray-200 hover:bg-white/10 transition-colors"
        >
          <UserAvatar 
            user={{ name: user.name, foto_url: user.foto_url }} 
            size="sm" 
          />
          <span className="hidden md:block text-sm font-medium">
            {user.name.split(' ')[0]}
          </span>
          <div className="w-2 h-2 bg-green-400 rounded-full absolute -top-1 -right-1"></div>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <UserAvatar 
              user={{ name: user.name, foto_url: user.foto_url }} 
              size="md" 
            />
            <div>
              <p className="font-semibold text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500 flex items-center">
                <TypeIcon className="w-4 h-4 mr-1" />
                {getUserTypeLabel()}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-2 py-4">
          {visibleItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start text-left h-12 px-4"
                onClick={() => handleAction(item.action)}
              >
                <Icon className="w-5 h-5 mr-3 text-gray-600" />
                <span className="text-gray-700">{item.label}</span>
              </Button>
            );
          })}
          
          {/* Separador */}
          <div className="border-t my-2"></div>
          
          {/* Botão de Logout */}
          <Button
            variant="ghost"
            className="w-full justify-start text-left h-12 px-4 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => handleAction(logout)}
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Sair</span>
          </Button>
        </div>
        
        <div className="pt-4 border-t text-center">
          <p className="text-xs text-gray-500">
            Academium UFC - Campus Itapajé
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
