import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/lib/use-auth";
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  Crown,
  Shield,
  UserCheck,
  UserPlus,
  Trash2
} from "lucide-react";
import brasaoBrancoHorizontal from "../../assets/img/brasao-branco-horizontal.png";
import { projectService, type Project, type User as UserType } from "@/lib/api";

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [availableCollaborators, setAvailableCollaborators] = useState<UserType[]>([]);
  const [collaboratorType, setCollaboratorType] = useState<'docente' | 'servidor' | 'discente'>('discente');

  // Função para criar link clicável para perfil público
  const createProfileLink = (userId: number, name: string, email: string, isClickable = true) => {
    if (!isClickable) {
      return (
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-gray-600">{email}</p>
        </div>
      );
    }

    return (
      <div 
        className="cursor-pointer hover:bg-blue-50 p-2 rounded-lg transition-colors"
        onClick={() => navigate(`/perfil-publico/${userId}`)}
      >
        <p className="font-medium text-blue-600 hover:text-blue-800">{name}</p>
        <p className="text-sm text-gray-600">{email}</p>
        <p className="text-xs text-blue-500 mt-1">Ver perfil público →</p>
      </div>
    );
  };

  const loadProject = useCallback(async () => {
    try {
      setLoading(true);
      const projectData = await projectService.getById(Number(id));
      setProject(projectData);
    } catch (error) {
      console.error("Erro ao carregar projeto:", error);
      setError("Erro ao carregar detalhes do projeto.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      navigate('/projetos');
      return;
    }
    
    loadProject();
  }, [id, navigate, loadProject]);

  const loadAvailableCollaborators = async (tipo: string) => {
    if (!project?.id) return;
    
    try {
      const collaborators = await projectService.getAvailableCollaborators(project.id, tipo);
      setAvailableCollaborators(collaborators);
    } catch (error) {
      console.error("Erro ao carregar colaboradores disponíveis:", error);
    }
  };

  const handleAddCollaborator = async (colaboradorId: number) => {
    if (!project?.id) return;
    
    try {
      await projectService.addCollaborator(project.id, colaboradorId, collaboratorType);
      await loadProject();
    } catch (error) {
      console.error("Erro ao adicionar colaborador:", error);
      alert("Erro ao adicionar colaborador. Tente novamente.");
    }
  };

  const handleRemoveCollaborator = async (colaboradorId: number, tipo: string) => {
    if (!project?.id) return;
    
    if (!confirm("Tem certeza que deseja remover este colaborador?")) {
      return;
    }
    
    try {
      await projectService.removeCollaborator(project.id, colaboradorId, tipo);
      await loadProject();
    } catch (error) {
      console.error("Erro ao remover colaborador:", error);
      alert("Erro ao remover colaborador. Tente novamente.");
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

  const canManageProject = () => {
    if (!user || !project) return false;
    
    return (
      user.type === 'admin' ||
      (project.coordinator && project.coordinator.id === user.id) ||
      (project.subCoordinator && project.subCoordinator.id === user.id)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando projeto...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Projeto não encontrado"}</p>
          <Button onClick={() => navigate('/projetos')}>
            Voltar aos Projetos
          </Button>
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
              <Button variant="ghost" onClick={() => navigate('/projetos')} className="text-white hover:text-gray-200">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <img
                src={brasaoBrancoHorizontal}
                className="h-12 w-24 object-contain"
                alt="Logo UFC"
              />
              <nav className="hidden md:flex items-center space-x-8">
                <Button variant="ghost" onClick={() => navigate('/')} className="text-white hover:text-gray-200">
                  Início
                </Button>
                {isAuthenticated && (
                  <Button variant="ghost" onClick={() => navigate('/perfil')} className="text-white hover:text-gray-200">
                    Perfil
                  </Button>
                )}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {/* Espaço para futuras ações do lado direito */}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Informações principais do projeto */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2">{project.title}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{project.area}</Badge>
                      {getStatusBadge(project.status || 'pending')}
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Criado em: {new Date(project.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-2">Descrição do Projeto</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{project.details}</p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar com coordenadores e colaboradores */}
          <div className="space-y-6">
            {/* Coordenação */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Coordenação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.coordinator && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-1">Coordenador/Idealizador do Projeto</h4>
                    <div className="flex items-center justify-between">
                      {createProfileLink(project.coordinator.id, project.coordinator.name, project.coordinator.email)}
                      {getUserTypeBadge(project.coordinator.type)}
                    </div>
                  </div>
                )}
                
                {project.subCoordinator && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-1">Sub-coordenador do Projeto</h4>
                    <div className="flex items-center justify-between">
                      {createProfileLink(project.subCoordinator.id, project.subCoordinator.name, project.subCoordinator.email)}
                      {getUserTypeBadge(project.subCoordinator.type)}
                    </div>
                  </div>
                )}

                {/* Coordenadores Institucionais */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-sm text-gray-600 mb-3">Coordenação Institucional</h4>
                  
                  {project.coordenadorInstitucional?.coordenador && (
                    <div className="mb-3">
                      <h5 className="font-medium text-xs text-blue-600 mb-1">
                        Coordenador de {project.coordenadorInstitucional.tipo === 'pesquisa' ? 'Pesquisa' : 'Extensão'}
                      </h5>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{project.coordenadorInstitucional.coordenador.user.name}</p>
                          <p className="text-xs text-gray-600">{project.coordenadorInstitucional.coordenador.user.email}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">Institucional</Badge>
                      </div>
                    </div>
                  )}

                  {project.coordenadorInstitucional?.coordenadorExtensao && (
                    <div>
                      <h5 className="font-medium text-xs text-green-600 mb-1">Coordenador de Extensão</h5>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{project.coordenadorInstitucional.coordenadorExtensao.user.name}</p>
                          <p className="text-xs text-gray-600">{project.coordenadorInstitucional.coordenadorExtensao.user.email}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">Institucional</Badge>
                      </div>
                    </div>
                  )}

                  {project.tipo && (
                    <div className="mt-2">
                      <Badge 
                        variant={project.tipo === 'pesquisa' ? 'default' : project.tipo === 'extensao' ? 'secondary' : 'outline'} 
                        className="text-xs"
                      >
                        Projeto de {project.tipo === 'pesquisa' ? 'Pesquisa' : project.tipo === 'extensao' ? 'Extensão' : 'Pesquisa e Extensão'}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Colaboradores */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Colaboradores ({project.collaborators?.length || 0})
                  </CardTitle>
                  {canManageProject() && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" onClick={() => loadAvailableCollaborators(collaboratorType)}>
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Adicionar Colaborador</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Tipo de Colaborador</label>
                            <select
                              value={collaboratorType}
                              onChange={(e) => {
                                setCollaboratorType(e.target.value as 'docente' | 'servidor' | 'discente');
                                loadAvailableCollaborators(e.target.value);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="discente">Discente</option>
                              <option value="docente">Docente</option>
                              <option value="servidor">Servidor</option>
                            </select>
                          </div>
                          
                          <div className="max-h-64 overflow-y-auto">
                            {availableCollaborators.length === 0 ? (
                              <p className="text-gray-500 text-center py-4">
                                Nenhum {collaboratorType} disponível
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {availableCollaborators.map((collaborator) => (
                                  <div key={collaborator.id} className="flex items-center justify-between p-2 border rounded-md">
                                    <div>
                                      <p className="font-medium">{collaborator.name}</p>
                                      <p className="text-sm text-gray-600">{collaborator.email}</p>
                                    </div>
                                    <Button
                                      size="sm"
                                      onClick={() => handleAddCollaborator(collaborator.id)}
                                    >
                                      Adicionar
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!project.collaborators || project.collaborators.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Nenhum colaborador adicionado
                  </p>
                ) : (
                  <div className="space-y-3">
                    {project.collaborators.map((collaborator, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{collaborator.user.name}</p>
                          <p className="text-sm text-gray-600">{collaborator.user.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getUserTypeBadge(collaborator.user.type)}
                          {canManageProject() && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveCollaborator(collaborator.user.id, collaborator.type)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
