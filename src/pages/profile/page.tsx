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
  Settings,
  GraduationCap,
  Monitor,
  Construction,
  AlertCircle
} from "lucide-react";
import brasaoBrancoHorizontal from "../../assets/img/brasao-branco-horizontal.png";
import { projectService, uploadService, type Project, type User } from "@/lib/api";

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    area: "",
    details: "",
    tipo: ""
  });

  // Função para upload de avatar
  const handleAvatarUpload = async (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      // Fazer upload usando o serviço
      const result = await uploadService.uploadAvatar(formData);
      
      // Atualizar o contexto com o novo usuário
      if (result.user) {
        console.log('Avatar atualizado com sucesso:', result.user.foto_url);
        alert('Avatar atualizado com sucesso!');
        
        // Recarregar a página para mostrar o novo avatar
        window.location.reload();
      }
      
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      alert('Erro ao fazer upload da imagem. Tente novamente.');
    }
  };

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
    if (!newProject.title.trim() || !newProject.area.trim() || !newProject.details.trim() || !newProject.tipo.trim()) {
      alert("Por favor, preencha todos os campos");
      return;
    }

    try {
      await projectService.create({
        title: newProject.title.trim(),
        area: newProject.area.trim(),
        details: newProject.details.trim(),
        tipo: newProject.tipo as 'pesquisa' | 'extensao' | 'misto'
      });
      await loadUserData();
      setNewProject({ title: "", area: "", details: "", tipo: "" });
      setIsCreateDialogOpen(false);
      alert("Projeto criado com sucesso e enviado para aprovação!");
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
                <div className="relative">
                  {user?.foto_url ? (
                    <img 
                      src={user.foto_url} 
                      alt={`Foto de ${user.name}`}
                      className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md border cursor-pointer hover:bg-gray-50">
                    <Edit className="h-3 w-3 text-gray-600" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleAvatarUpload}
                    />
                  </label>
                </div>
                <div>
                  <CardTitle className="text-2xl">{user?.name}</CardTitle>
                  <p className="text-gray-600">{user?.email}</p>
                  <div className="mt-2">
                    {user && getUserTypeBadge(user.type)}
                  </div>
                </div>
              </div>
              <Button variant="outline" onClick={() => setIsEditProfileOpen(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
            </div>
          </CardHeader>
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
                      
                      <div>
                        <Label htmlFor="tipo">Tipo do Projeto</Label>
                        <select
                          id="tipo"
                          value={newProject.tipo}
                          onChange={(e) => setNewProject({ ...newProject, tipo: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Selecione o tipo do projeto</option>
                          <option value="pesquisa">Pesquisa</option>
                          <option value="extensao">Extensão</option>
                          <option value="misto">Pesquisa e Extensão</option>
                        </select>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button onClick={handleCreateProject} className="flex-1">
                          Criar Projeto
                        </Button>
                        <Button variant="outline" onClick={() => {
                          setIsCreateDialogOpen(false);
                          setNewProject({ title: "", area: "", details: "", tipo: "" });
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
                            <p className="text-sm text-gray-600 mt-1">
                              Tipo: {project.tipo === 'pesquisa' ? 'Pesquisa' : 
                                     project.tipo === 'extensao' ? 'Extensão' : 
                                     project.tipo === 'misto' ? 'Pesquisa e Extensão' : 'Não especificado'}
                            </p>
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

        {/* Monitorias e Minicursos para Discentes */}
        {user?.type === 'discente' && (
          <>
            {/* Seção de Monitorias */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Minhas Monitorias (0)
                  </CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Monitoria
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Construction className="h-5 w-5 text-orange-500" />
                          Funcionalidade em Desenvolvimento
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 py-4">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-8 w-8 text-orange-500" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2 text-gray-800">
                            Sistema de Monitorias em Breve!
                          </h3>
                          <p className="text-gray-600 mb-4 leading-relaxed">
                            Estamos trabalhando para implementar o sistema de criação e gestão de monitorias.
                            Em breve você poderá criar e gerenciar suas atividades de monitoria diretamente na plataforma.
                          </p>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <h4 className="font-medium text-blue-800 mb-2">O que você poderá fazer:</h4>
                            <ul className="text-sm text-blue-700 space-y-1 text-left">
                              <li>• Criar propostas de monitoria para disciplinas</li>
                              <li>• Gerenciar cronogramas e atividades</li>
                              <li>• Acompanhar estudantes participantes</li>
                              <li>• Gerar relatórios de atividades</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma monitoria cadastrada</p>
                  <p className="text-sm">Clique em "Nova Monitoria" para começar.</p>
                </div>
              </CardContent>
            </Card>

            {/* Seção de Minicursos */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Meus Minicursos (0)
                  </CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Minicurso
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Construction className="h-5 w-5 text-orange-500" />
                          Funcionalidade em Desenvolvimento
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 py-4">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-8 w-8 text-orange-500" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2 text-gray-800">
                            Sistema de Minicursos em Breve!
                          </h3>
                          <p className="text-gray-600 mb-4 leading-relaxed">
                            Estamos desenvolvendo o sistema de criação e gestão de minicursos.
                            Em breve você poderá propor e conduzir minicursos para a comunidade acadêmica.
                          </p>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                            <h4 className="font-medium text-green-800 mb-2">O que você poderá fazer:</h4>
                            <ul className="text-sm text-green-700 space-y-1 text-left">
                              <li>• Criar propostas de minicursos</li>
                              <li>• Definir cronogramas e conteúdo programático</li>
                              <li>• Gerenciar inscrições de participantes</li>
                              <li>• Emitir certificados de participação</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum minicurso cadastrado</p>
                  <p className="text-sm">Clique em "Novo Minicurso" para começar.</p>
                </div>
              </CardContent>
            </Card>
          </>
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
