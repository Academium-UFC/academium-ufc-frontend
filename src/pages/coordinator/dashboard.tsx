import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/use-auth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { UserMenu } from "@/components/ui/user-menu";
import {
  Crown,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
  UserMinus,
  ArrowLeft,
  Eye
} from 'lucide-react';
import { institutionalCoordinatorService, projectService, userService, type Project, type User, type Collaborator } from '@/lib/api';
import brasaoBrancoHorizontal from "../../assets/img/brasao-branco-horizontal.png";

export default function CoordinatorDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedUserType, setSelectedUserType] = useState<string>('');
  const [approvalNotes, setApprovalNotes] = useState('');

  // Verificar se o usuário é coordenador institucional
  useEffect(() => {
    if (!authLoading && (!user || !user.coordenador_institucional?.ativo)) {
      navigate('/');
      return;
    }
  }, [user, authLoading, navigate]);

  // Carregar projetos supervisionados
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await institutionalCoordinatorService.getSupervisedProjects(
        user?.coordenador_institucional?.tipo
      );
      setProjects(data);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      setError('Erro ao carregar projetos');
    } finally {
      setLoading(false);
    }
  }, [user?.coordenador_institucional?.tipo]);

  useEffect(() => {
    if (user?.coordenador_institucional?.ativo) {
      loadProjects();
    }
  }, [user, loadProjects]);

  const loadAvailableUsers = async () => {
    try {
      const users = await userService.getAll();
      setAvailableUsers(users.filter(u => u.type !== 'admin'));
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const loadProjectCollaborators = async (projectId: number) => {
    try {
      const data = await institutionalCoordinatorService.getProjectCollaborators(projectId);
      setCollaborators(data);
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
    }
  };

  const handleApproveProject = async (projectId: number, action: 'approved' | 'rejected') => {
    try {
      setLoading(true);
      await institutionalCoordinatorService.approveProject(projectId, action, approvalNotes);
      setMessage(`Projeto ${action === 'approved' ? 'aprovado' : 'rejeitado'} com sucesso!`);
      setApprovalNotes('');
      loadProjects();
    } catch (error) {
      console.error('Erro ao aprovar projeto:', error);
      setError('Erro ao processar aprovação do projeto');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSubCoordinator = async (projectId: number) => {
    if (!selectedUser || !selectedUserType) {
      setError('Selecione um usuário e tipo');
      return;
    }

    try {
      setLoading(true);
      await institutionalCoordinatorService.assignSubCoordinator(projectId, selectedUser, selectedUserType);
      setMessage('Sub-coordenador atribuído com sucesso!');
      setSelectedUser(null);
      setSelectedUserType('');
      loadProjects();
    } catch (error) {
      console.error('Erro ao atribuir sub-coordenador:', error);
      setError('Erro ao atribuir sub-coordenador');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSubCoordinator = async (projectId: number) => {
    try {
      setLoading(true);
      await institutionalCoordinatorService.removeSubCoordinator(projectId);
      setMessage('Sub-coordenador removido com sucesso!');
      loadProjects();
    } catch (error) {
      console.error('Erro ao remover sub-coordenador:', error);
      setError('Erro ao remover sub-coordenador');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCollaborator = async (projectId: number) => {
    if (!selectedUser || !selectedUserType) {
      setError('Selecione um usuário e tipo');
      return;
    }

    try {
      setLoading(true);
      await projectService.addCollaborator(projectId, selectedUser, selectedUserType);
      setMessage('Colaborador adicionado com sucesso!');
      setSelectedUser(null);
      setSelectedUserType('');
      if (selectedProject) {
        loadProjectCollaborators(selectedProject.id);
      }
    } catch (error) {
      console.error('Erro ao adicionar colaborador:', error);
      setError('Erro ao adicionar colaborador');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (projectId: number, colaboradorId: number, colaboradorType: string) => {
    try {
      setLoading(true);
      await projectService.removeCollaborator(projectId, colaboradorId, colaboradorType);
      setMessage('Colaborador removido com sucesso!');
      if (selectedProject) {
        loadProjectCollaborators(selectedProject.id);
      }
    } catch (error) {
      console.error('Erro ao remover colaborador:', error);
      setError('Erro ao remover colaborador');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return <div>Carregando...</div>;
  }

  if (!user.coordenador_institucional?.ativo) {
    return <div>Acesso negado - Você não é um coordenador institucional ativo</div>;
  }

  const pendingProjects = projects.filter(p => p.status === 'pending');
  const approvedProjects = projects.filter(p => p.status === 'approved');
  const coordinatorType = user.coordenador_institucional.tipo;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-800 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-white hover:bg-green-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <img src={brasaoBrancoHorizontal} alt="UFC" className="h-8" />
            <div>
              <h1 className="text-xl font-bold">
                Painel do Coordenador Institucional de {coordinatorType === 'pesquisa' ? 'Pesquisa' : 'Extensão'}
              </h1>
              <p className="text-green-100">{user.name}</p>
            </div>
          </div>
          <UserMenu />
        </div>
      </div>

      {/* Mensagens */}
      {message && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
            {message}
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
            {error}
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Projetos Pendentes</p>
                  <p className="text-3xl font-bold text-orange-600">{pendingProjects.length}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Projetos Aprovados</p>
                  <p className="text-3xl font-bold text-green-600">{approvedProjects.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Projetos</p>
                  <p className="text-3xl font-bold text-blue-600">{projects.length}</p>
                </div>
                <Crown className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Projetos */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">Projetos Pendentes ({pendingProjects.length})</TabsTrigger>
            <TabsTrigger value="approved">Projetos Aprovados ({approvedProjects.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            {pendingProjects.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum projeto pendente de aprovação</p>
                </CardContent>
              </Card>
            ) : (
              pendingProjects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{project.title}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{project.area}</Badge>
                        <Badge variant="secondary">{project.tipo}</Badge>
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          Pendente
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-600 line-clamp-3">{project.details}</p>
                      
                      {/* Coordenadores */}
                      <div className="flex flex-wrap gap-4">
                        {project.coordinator && (
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">Coordenador</Badge>
                            <span className="text-sm">{project.coordinator.user.name}</span>
                          </div>
                        )}
                        {project.subCoordinator && (
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">Sub-coordenador</Badge>
                            <span className="text-sm">{project.subCoordinator.user.name}</span>
                          </div>
                        )}
                      </div>

                      {/* Ações */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/projetos/${project.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </Button>
                        </div>

                        <div className="flex items-center space-x-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                                <XCircle className="h-4 w-4 mr-2" />
                                Rejeitar
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Rejeitar Projeto</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja rejeitar o projeto "{project.title}"?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="space-y-4">
                                <Label htmlFor="notes">Observações (opcional)</Label>
                                <Textarea
                                  id="notes"
                                  placeholder="Motivo da rejeição..."
                                  value={approvalNotes}
                                  onChange={(e) => setApprovalNotes(e.target.value)}
                                />
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleApproveProject(project.id, 'rejected')}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Rejeitar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Aprovar
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Aprovar Projeto</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Confirma a aprovação do projeto "{project.title}"?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="space-y-4">
                                <Label htmlFor="approval-notes">Observações (opcional)</Label>
                                <Textarea
                                  id="approval-notes"
                                  placeholder="Comentários sobre a aprovação..."
                                  value={approvalNotes}
                                  onChange={(e) => setApprovalNotes(e.target.value)}
                                />
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleApproveProject(project.id, 'approved')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Aprovar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-6">
            {approvedProjects.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum projeto aprovado ainda</p>
                </CardContent>
              </Card>
            ) : (
              approvedProjects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{project.title}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{project.area}</Badge>
                        <Badge variant="secondary">{project.tipo}</Badge>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Aprovado
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-600 line-clamp-3">{project.details}</p>
                      
                      {/* Coordenadores */}
                      <div className="flex flex-wrap gap-4">
                        {project.coordinator && (
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">Coordenador</Badge>
                            <span className="text-sm">{project.coordinator.user.name}</span>
                          </div>
                        )}
                        {project.subCoordinator ? (
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">Sub-coordenador</Badge>
                            <span className="text-sm">{project.subCoordinator.user.name}</span>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50">
                                  <UserMinus className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remover Sub-coordenador</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja remover {project.subCoordinator.user.name} como sub-coordenador?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRemoveSubCoordinator(project.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Remover
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={loadAvailableUsers}
                              >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Atribuir Sub-coordenador
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Atribuir Sub-coordenador</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="user-select">Usuário</Label>
                                  <Select onValueChange={(value: string) => setSelectedUser(Number(value))}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione um usuário" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableUsers.map((user) => (
                                        <SelectItem key={user.id} value={user.id.toString()}>
                                          {user.name} ({user.type})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="type-select">Tipo</Label>
                                  <Select onValueChange={setSelectedUserType}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="docente">Docente</SelectItem>
                                      <SelectItem value="servidor">Servidor</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button
                                  onClick={() => handleAssignSubCoordinator(project.id)}
                                  disabled={!selectedUser || !selectedUserType || loading}
                                  className="w-full"
                                >
                                  Atribuir Sub-coordenador
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>

                      {/* Ações */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/projetos/${project.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </Button>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedProject(project);
                                  loadProjectCollaborators(project.id);
                                  loadAvailableUsers();
                                }}
                              >
                                <Users className="h-4 w-4 mr-2" />
                                Gerenciar Colaboradores
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>Gerenciar Colaboradores - {project.title}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-6">
                                {/* Adicionar Colaborador */}
                                <div className="space-y-4">
                                  <h4 className="font-medium">Adicionar Colaborador</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Usuário</Label>
                                      <Select onValueChange={(value: string) => setSelectedUser(Number(value))}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Selecione um usuário" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {availableUsers.map((user) => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                              {user.name} ({user.type})
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label>Tipo</Label>
                                      <Select onValueChange={setSelectedUserType}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Selecione o tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="docente">Docente</SelectItem>
                                          <SelectItem value="discente">Discente</SelectItem>
                                          <SelectItem value="servidor">Servidor</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  <Button
                                    onClick={() => handleAddCollaborator(project.id)}
                                    disabled={!selectedUser || !selectedUserType || loading}
                                  >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Adicionar Colaborador
                                  </Button>
                                </div>

                                {/* Lista de Colaboradores */}
                                <div className="space-y-4">
                                  <h4 className="font-medium">Colaboradores Atuais</h4>
                                  {collaborators.length === 0 ? (
                                    <p className="text-gray-600">Nenhum colaborador adicionado ainda</p>
                                  ) : (
                                    <div className="space-y-2">
                                      {collaborators.map((collaborator) => (
                                        <div key={collaborator.id} className="flex items-center justify-between p-3 border rounded-lg">
                                          <div className="flex items-center space-x-3">
                                            <div>
                                              <p className="font-medium">{collaborator.user.name}</p>
                                              <p className="text-sm text-gray-600">{collaborator.user.email}</p>
                                            </div>
                                            <Badge variant="outline">{collaborator.type}</Badge>
                                          </div>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-600 hover:bg-red-50"
                                            onClick={() => handleRemoveCollaborator(project.id, collaborator.user.id, collaborator.type)}
                                          >
                                            <UserMinus className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
