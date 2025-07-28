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
import { useAuth } from "@/lib/use-auth";
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
  ArrowLeft
} from "lucide-react";
import brasaoBrancoHorizontal from "../../assets/img/brasao-branco-horizontal.png";
import { adminService, userService, projectService, type Project, type User, type AdminStats } from "@/lib/api";

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [promoteEmail, setPromoteEmail] = useState("");
  const [coordinatorUserId, setCoordinatorUserId] = useState("");
  const [coordinatorType, setCoordinatorType] = useState<'pesquisa' | 'extensao'>('pesquisa');

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
        projectService.getAll(),
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
      await projectService.approve(projectId, action, approvalNotes);
      await loadAdminData();
      setApprovalNotes("");
    } catch (error) {
      console.error("Erro ao processar projeto:", error);
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

  const handlePromoteToCoordinator = async () => {
    if (!coordinatorUserId.trim()) return;
    
    try {
      await adminService.promoteToCoordinator(parseInt(coordinatorUserId), coordinatorType);
      await loadAdminData();
      setCoordinatorUserId("");
      alert(`Usuário promovido a Coordenador de ${coordinatorType === 'pesquisa' ? 'Pesquisa' : 'Extensão'} com sucesso!`);
    } catch (error) {
      console.error("Erro ao promover usuário a coordenador:", error);
      alert("Erro ao promover usuário a coordenador. Verifique se o ID do usuário existe.");
    }
  };

  const handleDemoteFromCoordinator = async (userId: number) => {
    try {
      await adminService.demoteFromCoordinator(userId);
      await loadAdminData();
      alert("Usuário removido do cargo de coordenador com sucesso!");
    } catch (error) {
      console.error("Erro ao remover coordenador:", error);
      alert("Erro ao remover coordenador.");
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Usuários Totais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
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
                <p className="text-3xl font-bold text-green-600">{stats.totalProjects}</p>
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
                <p className="text-3xl font-bold text-orange-600">{stats.pendingProjects}</p>
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
                <p className="text-3xl font-bold text-purple-600">{stats.totalAdmins}</p>
              </CardContent>
            </Card>
          </div>
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
            </div>
            
            <div className="grid gap-4">
              {projects.map((project: Project) => (
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
                              onClick={() => setSelectedProject(project)}
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
                                  placeholder="Adicione observações sobre a decisão..."
                                  value={approvalNotes}
                                  onChange={(e) => setApprovalNotes(e.target.value)}
                                  className="mt-2"
                                />
                              </div>
                              
                              <div className="flex gap-2">
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
                                  variant="outline"
                                >
                                  <Pause className="h-4 w-4 mr-2" />
                                  Inativar
                                </Button>
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
          </TabsContent>

          {/* Coordenadores */}
          <TabsContent value="coordinators" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gerenciar Coordenadores</h2>
            </div>
            
            {/* Promover a Coordenador */}
            <Card>
              <CardHeader>
                <CardTitle>Promover Usuário a Coordenador</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Input
                    placeholder="ID do usuário"
                    value={coordinatorUserId}
                    onChange={(e) => setCoordinatorUserId(e.target.value)}
                    type="number"
                  />
                  <select
                    value={coordinatorType}
                    onChange={(e) => setCoordinatorType(e.target.value as 'pesquisa' | 'extensao')}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="pesquisa">Coordenador de Pesquisa</option>
                    <option value="extensao">Coordenador de Extensão</option>
                  </select>
                  <Button onClick={handlePromoteToCoordinator}>
                    Promover
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Coordenadores */}
            <div className="grid gap-4">
              {users
                .filter(user => user.coordenador_institucional?.ativo)
                .map((coordinator) => (
                <Card key={coordinator.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg">{coordinator.name}</CardTitle>
                        <p className="text-sm text-gray-600">{coordinator.email}</p>
                        <p className="text-sm text-gray-500">
                          Coordenador de {coordinator.coordenador_institucional?.tipo === 'pesquisa' ? 'Pesquisa' : 'Extensão'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getUserTypeBadge(coordinator.type)}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              Remover Cargo
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover do cargo de coordenador?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação removerá {coordinator.name} do cargo de coordenador. Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDemoteFromCoordinator(coordinator.id)}>
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Usuários */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
            </div>
            
            <div className="grid gap-4">
              {users.map((userData) => (
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
          </TabsContent>

          {/* Administradores */}
          <TabsContent value="admins" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gerenciar Administradores</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Promover Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent>
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
                    <Button onClick={handlePromoteUser} className="w-full">
                      Promover a Administrador
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid gap-4">
              {admins.map((admin) => (
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
