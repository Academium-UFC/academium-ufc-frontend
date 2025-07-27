import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/use-auth";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  Calendar,
  Crown,
  Shield,
  Users,
  UserCheck,
  Edit,
  Plus,
  Trash2,
  ArrowLeft,
  Settings
} from "lucide-react";
import brasaoBrancoHorizontal from "../../assets/img/brasao-branco-horizontal.png";
import { projectService, type Project } from "@/lib/api";

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    area: "",
    details: ""
  });

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      if (user?.type === 'docente' || user?.type === 'servidor' || user?.type === 'admin') {
        const projects = await projectService.getMyProjects();
        setMyProjects(projects);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.type]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    loadUserData();
  }, [user, isAuthenticated, navigate, loadUserData]);

  const handleCreateProject = async () => {
    if (!newProject.title.trim() || !newProject.area.trim() || !newProject.details.trim()) {
      alert("Por favor, preencha todos os campos");
      return;
    }

    try {
      await projectService.create(newProject);
      await loadUserData();
      setNewProject({ title: "", area: "", details: "" });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Erro ao criar projeto:", error);
      alert("Erro ao criar projeto. Tente novamente.");
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!confirm("Tem certeza que deseja excluir este projeto?")) {
      return;
    }

    try {
      await projectService.delete(projectId);
      await loadUserData();
    } catch (error) {
      console.error("Erro ao excluir projeto:", error);
      alert("Erro ao excluir projeto. Tente novamente.");
    }
  };

  const getUserTypeBadge = (type: string) => {
    const typeConfig = {
      'admin': { label: 'Administrador', variant: 'destructive' as const, icon: Crown },
      'docente': { label: 'Docente', variant: 'default' as const, icon: UserCheck },
      'servidor': { label: 'Servidor', variant: 'secondary' as const, icon: Shield },
      'discente': { label: 'Discente', variant: 'outline' as const, icon: Users }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.discente;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { label: 'Pendente', variant: 'secondary' as const },
      'approved': { label: 'Aprovado', variant: 'default' as const },
      'rejected': { label: 'Rejeitado', variant: 'destructive' as const },
      'inactivated': { label: 'Inativo', variant: 'outline' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/')} className="text-white hover:text-gray-200">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <img
                src={brasaoBrancoHorizontal}
                className="h-12 w-24 object-contain"
                alt="Logo UFC"
              />
              <h1 className="text-xl font-semibold">Meu Perfil</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/projetos')} className="text-white hover:text-gray-200">
                Projetos
              </Button>
              {user?.type === 'admin' && (
                <Button variant="ghost" onClick={() => navigate('/admin')} className="text-white hover:text-gray-200">
                  Admin
                </Button>
              )}
              <Button variant="ghost" onClick={logout} className="text-white hover:text-gray-200">
                Sair
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Informações do Usuário */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <CardTitle className="text-2xl">{user?.name}</CardTitle>
                  <p className="text-gray-600">{user?.email}</p>
                  <div className="mt-2">
                    {user && getUserTypeBadge(user.type)}
                  </div>
                </div>
              </div>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Projetos do Usuário */}
        {(user?.type === 'docente' || user?.type === 'servidor' || user?.type === 'admin') && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Meus Projetos ({myProjects.length})
                </CardTitle>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Projeto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Criar Novo Projeto</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Título do Projeto</Label>
                        <Input
                          id="title"
                          placeholder="Digite o título do projeto..."
                          value={newProject.title}
                          onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="area">Área de Pesquisa</Label>
                        <Input
                          id="area"
                          placeholder="Digite a área de pesquisa..."
                          value={newProject.area}
                          onChange={(e) => setNewProject({ ...newProject, area: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="details">Descrição do Projeto</Label>
                        <Textarea
                          id="details"
                          placeholder="Descreva detalhadamente o projeto..."
                          value={newProject.details}
                          onChange={(e) => setNewProject({ ...newProject, details: e.target.value })}
                          rows={4}
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button onClick={handleCreateProject} className="flex-1">
                          Criar Projeto
                        </Button>
                        <Button variant="outline" onClick={() => {
                          setIsCreateDialogOpen(false);
                          setNewProject({ title: "", area: "", details: "" });
                        }}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {myProjects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Você ainda não possui projetos cadastrados.</p>
                  <p className="text-sm">Clique em "Novo Projeto" para começar.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {myProjects.map((project) => (
                    <Card key={project.id} className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{project.title}</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">Área: {project.area}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <Calendar className="h-3 w-3" />
                              Criado em: {new Date(project.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(project.status || 'pending')}
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteProject(project.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 line-clamp-2">{project.details}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Para discentes - mostrar projetos que participa */}
        {user?.type === 'discente' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Projetos que Participo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Você não está participando de nenhum projeto no momento.</p>
                <p className="text-sm">Entre em contato com docentes para participar de projetos.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
