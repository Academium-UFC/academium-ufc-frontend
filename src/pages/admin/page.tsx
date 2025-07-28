import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ToastContainer } from "@/components/ui/toast-container";
import { useAuth } from "@/lib/use-auth";
import { useToast } from "@/lib/use-toast"; 
import { useNavigate } from "react-router-dom";
import { UserMenu } from "@/components/ui/user-menu";
import { 
  Users, 
  BookOpen, 
  UserCheck, 
  UserX, 
  Calendar,
  Crown,
  Shield,
  UserPlus,
  Trash,
  Check,
  X,
  Pause,
  ArrowLeft,
  Search,
  Filter
} from "lucide-react";
import CoordinatorsManagement from "./coordinators";
import brasaoBrancoHorizontal from "../../assets/img/brasao-branco-horizontal.png";
import { adminService, userService, projectService, type Project, type User, type AdminStats } from "@/lib/api";

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toasts, hideToast, success, error } = useToast();
  
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [promoteEmail, setPromoteEmail] = useState("");
  
  // Estados para filtros
  const [projectFilter, setProjectFilter] = useState("pending");
  const [userSearchFilter, setUserSearchFilter] = useState("");
  const [adminSearchFilter, setAdminSearchFilter] = useState("");

  useEffect(() => {
    if (!isAuthenticated || user?.type !== 'admin') {
      navigate('/');
      return;
    }
    
    loadAdminData();
  }, [user, isAuthenticated, navigate]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsData, projectsData, usersData, adminsData] = await Promise.all([
        adminService.getStats(),
        projectService.getAllAdmin(), // Usar método específico para admin
        userService.getAll(),
        adminService.getAdmins()
      ]);
      
      setStats(statsData);
      setProjects(projectsData);
      setUsers(usersData);
      setAdmins(adminsData);
    } catch (error) {
      console.error("Erro ao carregar dados administrativos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectApproval = async (projectId: number, action: 'approved' | 'rejected' | 'inactivated') => {
    try {
      // Validação específica para rejeições
      if (action === 'rejected' && !approvalNotes.trim()) {
        error('Por favor, forneça um motivo para a rejeição do projeto.');
        return;
      }
      
      // Validação para inativação
      if (action === 'inactivated' && !approvalNotes.trim()) {
        error('Por favor, forneça um motivo para inativar o projeto.');
        return;
      }
      
      console.log('Attempting to approve project:', { projectId, action, notes: approvalNotes });
      
      const result = await projectService.approve(projectId, action, approvalNotes);
      
      console.log('Approval result:', result);
      
      await loadAdminData();
      setApprovalNotes("");
      
      // Feedback específico para cada ação
      if (action === 'approved') {
        success('Projeto aprovado com sucesso!');
      } else if (action === 'rejected') {
        success('Projeto rejeitado. O coordenador será notificado do motivo.');
      } else if (action === 'inactivated') {
        success('Projeto inativado com sucesso.');
      }
    } catch (err: unknown) {
      console.error("Erro ao processar projeto:", err);
      error('Erro ao processar projeto. Verifique o console para mais detalhes.');
    }
  };

  const handlePromoteUser = async () => {
    if (!promoteEmail.trim()) return;
    
    try {
      await adminService.promoteToAdmin(promoteEmail);
      await loadAdminData();
      setPromoteEmail("");
    } catch (error) {
      console.error("Erro ao promover usuário:", error);
    }
  };

  const handleDemoteAdmin = async (userId: number) => {
    try {
      await adminService.demoteFromAdmin(userId);
      await loadAdminData();
    } catch (error) {
      console.error("Erro ao rebaixar administrador:", error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await userService.delete(userId);
      await loadAdminData();
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
    }
  };

  // Função para carregar projetos com filtro do backend
  const loadProjectsWithFilter = async (status?: string) => {
    try {
      const filters = status && status !== 'all' ? { status } : {};
      const projectsData = await projectService.getAllAdmin(filters);
      setProjects(projectsData);
    } catch (error) {
      console.error("Erro ao carregar projetos filtrados:", error);
    }
  };

  // Atualizar projetos quando o filtro mudar
  useEffect(() => {
    if (!loading) {
      loadProjectsWithFilter(projectFilter);
    }
  }, [projectFilter, loading]);

  // Funções de filtro (agora só para fallback, pois o filtro principal é no backend)
  const filteredProjects = projects;

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(userSearchFilter.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchFilter.toLowerCase())
  );

  const filteredAdmins = admins.filter(admin =>
    admin.name.toLowerCase().includes(adminSearchFilter.toLowerCase()) ||
    admin.email.toLowerCase().includes(adminSearchFilter.toLowerCase())
  );

  // Incluir todos os usuários na lista de administradores para promoção
  const allUsersForPromotion = users.filter(user =>
    user.type !== 'admin' && (
      user.name.toLowerCase().includes(adminSearchFilter.toLowerCase()) ||
      user.email.toLowerCase().includes(adminSearchFilter.toLowerCase())
    )
  );

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando painel administrativo...</p>
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
              <h1 className="text-xl font-semibold">Painel Administrativo</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/projetos')} className="text-white hover:text-gray-200">
                Projetos
              </Button>
              <UserMenu />
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Estatísticas */}
        {stats && (
          <>
            {/* Estatísticas Gerais */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Usuários Totais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">{stats.users.total}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Projetos Totais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">{stats.projects.total}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Projetos Pendentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-orange-600">{stats.projects.pending}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    Administradores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-purple-600">{stats.users.admins}</p>
                </CardContent>
              </Card>
            </div>

            {/* Estatísticas Detalhadas de Usuários */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Docentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-indigo-600">{stats.users.docentes}</p>
                  <p className="text-sm text-gray-500">
                    {((stats.users.docentes / stats.users.total) * 100).toFixed(1)}% do total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Servidores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-teal-600">{stats.users.servidores}</p>
                  <p className="text-sm text-gray-500">
                    {((stats.users.servidores / stats.users.total) * 100).toFixed(1)}% do total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Discentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-cyan-600">{stats.users.discentes}</p>
                  <p className="text-sm text-gray-500">
                    {((stats.users.discentes / stats.users.total) * 100).toFixed(1)}% do total
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Estatísticas Detalhadas de Projetos */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Check className="h-5 w-5" />
                    Aprovados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">{stats.projects.approved}</p>
                  <p className="text-sm text-gray-500">
                    {stats.projects.total > 0 ? ((stats.projects.approved / stats.projects.total) * 100).toFixed(1) : 0}% do total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <X className="h-5 w-5" />
                    Rejeitados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-600">{stats.projects.rejected}</p>
                  <p className="text-sm text-gray-500">
                    {stats.projects.total > 0 ? ((stats.projects.rejected / stats.projects.total) * 100).toFixed(1) : 0}% do total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pause className="h-5 w-5" />
                    Inativos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-gray-600">{stats.projects.inactive}</p>
                  <p className="text-sm text-gray-500">
                    {stats.projects.total > 0 ? ((stats.projects.inactive / stats.projects.total) * 100).toFixed(1) : 0}% do total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Aguardando
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-orange-600">{stats.projects.pending}</p>
                  <p className="text-sm text-gray-500">
                    {stats.projects.total > 0 ? ((stats.projects.pending / stats.projects.total) * 100).toFixed(1) : 0}% do total
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="projects">Projetos</TabsTrigger>
            <TabsTrigger value="coordinators">Coordenadores</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="admins">Administradores</TabsTrigger>
          </TabsList>

          {/* Projetos */}
          <TabsContent value="projects" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gerenciar Projetos</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-600" />
                  <select
                    value={projectFilter}
                    onChange={(e) => setProjectFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pendentes</option>
                    <option value="approved">Aprovados</option>
                    <option value="rejected">Rejeitados</option>
                    <option value="inactivated">Inativos</option>
                    <option value="all">Todos</option>
                  </select>
                </div>
              </div>
            </div>
            
            {filteredProjects.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <p className="text-gray-500">
                    {projectFilter === "pending" 
                      ? "Nenhum projeto pendente encontrado."
                      : `Nenhum projeto ${projectFilter === "all" ? "" : projectFilter} encontrado.`
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredProjects.map((project: Project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">Área: {project.area}</p>
                        <p className="text-sm text-gray-500">
                          Criado em: {new Date(project.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(project.status || 'pending')}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                            >
                              Gerenciar
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Gerenciar Projeto: {project.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Descrição do Projeto</Label>
                                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                  <p className="text-sm">{project.details}</p>
                                </div>
                              </div>
                              
                              <div>
                                <Label htmlFor="notes">Observações da Revisão</Label>
                                <Textarea
                                  id="notes"
                                  placeholder={
                                    project.status === 'pending' 
                                      ? "Para rejeições, é obrigatório informar o motivo detalhado que será enviado ao coordenador..."
                                      : "Adicione observações sobre a decisão..."
                                  }
                                  value={approvalNotes}
                                  onChange={(e) => setApprovalNotes(e.target.value)}
                                  className="mt-2"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  💡 As observações de aprovação/rejeição ficarão visíveis no perfil do coordenador
                                </p>
                              </div>
                              
                              {project.status === 'pending' && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                  <p className="text-sm text-blue-800 font-medium mb-2">ℹ️ Ações Disponíveis:</p>
                                  <ul className="text-xs text-blue-700 space-y-1">
                                    <li>• <strong>Aprovar:</strong> Projeto será listado publicamente</li>
                                    <li>• <strong>Rejeitar:</strong> Coordenador verá o motivo no perfil (obrigatório informar)</li>
                                    <li>• <strong>Inativar:</strong> Projeto será suspenso temporariamente</li>
                                  </ul>
                                </div>
                              )}
                              
                              <div className="flex gap-2">
                                {project.status === 'pending' ? (
                                  <>
                                    <Button 
                                      onClick={() => handleProjectApproval(project.id, 'approved')}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <Check className="h-4 w-4 mr-2" />
                                      Aprovar
                                    </Button>
                                    <Button 
                                      onClick={() => handleProjectApproval(project.id, 'rejected')}
                                      variant="destructive"
                                    >
                                      <X className="h-4 w-4 mr-2" />
                                      Rejeitar
                                    </Button>
                                    <Button 
                                      onClick={() => handleProjectApproval(project.id, 'inactivated')}
                                      variant="secondary"
                                    >
                                      <Pause className="h-4 w-4 mr-2" />
                                      Inativar
                                    </Button>
                                  </>
                                ) : (
                                  <div className="text-sm text-gray-600">
                                    Status atual: <strong>{getStatusBadge(project.status || 'pending')}</strong>
                                    {project.reviewed_at && (
                                      <p className="mt-1">
                                        Revisado em: {new Date(project.reviewed_at).toLocaleDateString('pt-BR')}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
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
          </TabsContent>

          {/* Coordenadores */}
          <TabsContent value="coordinators" className="space-y-4">
            <CoordinatorsManagement />
          </TabsContent>

          {/* Usuários */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-600" />
                <Input
                  placeholder="Buscar usuários..."
                  value={userSearchFilter}
                  onChange={(e) => setUserSearchFilter(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>
            
            {filteredUsers.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <p className="text-gray-500">
                    {userSearchFilter 
                      ? `Nenhum usuário encontrado para "${userSearchFilter}".`
                      : "Nenhum usuário cadastrado."
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredUsers.map((userData) => (
                <Card key={userData.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg">{userData.name}</CardTitle>
                        <p className="text-sm text-gray-600">{userData.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getUserTypeBadge(userData.type)}
                        {userData.type !== 'admin' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o usuário {userData.name}? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteUser(userData.id)}>
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Administradores */}
          <TabsContent value="admins" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gerenciar Administradores</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-600" />
                  <Input
                    placeholder="Buscar usuários..."
                    value={adminSearchFilter}
                    onChange={(e) => setAdminSearchFilter(e.target.value)}
                    className="w-64"
                  />
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Promover Usuário
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Promover Usuário a Administrador</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="email">Email do Usuário</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Digite o email do usuário..."
                          value={promoteEmail}
                          onChange={(e) => setPromoteEmail(e.target.value)}
                        />
                      </div>
                      
                      {/* Lista de usuários disponíveis para promoção */}
                      <div className="max-h-64 overflow-y-auto border rounded-md">
                        <div className="p-3 bg-gray-50 border-b">
                          <h4 className="font-medium text-sm">Usuários Disponíveis</h4>
                        </div>
                        {allUsersForPromotion.map((user) => (
                          <div
                            key={user.id}
                            className="p-3 border-b hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                            onClick={() => setPromoteEmail(user.email)}
                          >
                            <div>
                              <p className="font-medium text-sm">{user.name}</p>
                              <p className="text-xs text-gray-600">{user.email}</p>
                            </div>
                            {getUserTypeBadge(user.type)}
                          </div>
                        ))}
                        {allUsersForPromotion.length === 0 && (
                          <div className="p-8 text-center text-gray-500">
                            <p>Nenhum usuário encontrado</p>
                          </div>
                        )}
                      </div>
                      
                      <Button onClick={handlePromoteUser} className="w-full">
                        Promover a Administrador
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            {/* Administradores atuais */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Administradores Atuais</h3>
              {filteredAdmins.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <p className="text-gray-500">
                      {adminSearchFilter 
                        ? `Nenhum administrador encontrado para "${adminSearchFilter}".`
                        : "Nenhum administrador encontrado."
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredAdmins.map((admin) => (
                <Card key={admin.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Crown className="h-5 w-5 text-yellow-500" />
                          {admin.name}
                        </CardTitle>
                        <p className="text-sm text-gray-600">{admin.email}</p>
                      </div>
                      {admin.id !== user?.id && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <UserX className="h-4 w-4 mr-2" />
                              Rebaixar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Rebaixamento</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja rebaixar {admin.name} de administrador para usuário comum?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDemoteAdmin(admin.id)}>
                                Rebaixar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </CardHeader>
                </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <ToastContainer toasts={toasts} hideToast={hideToast} />
    </div>
  );
}
