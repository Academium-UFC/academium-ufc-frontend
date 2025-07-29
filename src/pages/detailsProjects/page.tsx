"use client";

import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  Tag,
  Loader,
  ExternalLink,
  Share2,
  BookOpen,
  Users,
  Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { projectService, type Project } from "@/lib/api";
import { useAuth } from "@/lib/use-auth";
import { UserMenu } from "@/components/ui/user-menu";
import brasaoBrancoHorizontal from "../../assets/img/brasao-branco-horizontal.png";

export default function DetailsProjects() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      if (!id) {
        setError("ID do projeto não encontrado");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const projectData = await projectService.getById(Number(id));
        console.log("Dados do projeto carregados:", projectData);
        console.log("Colaboradores:", projectData.collaborators);
        setProject(projectData);
      } catch (error) {
        console.error("Erro ao carregar projeto:", error);
        setError("Projeto não encontrado ou erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id]);

  // Função para verificar se o usuário pode gerenciar o projeto
  const canManageProject = () => {
    if (!user || !project) return false;
    
    // Admin pode gerenciar todos os projetos
    if (user.type === 'admin') return true;
    
    // Coordenador do projeto pode gerenciar
    if (project.coordinator?.userId === user.id) return true;
    
    // Sub-coordenador do projeto pode gerenciar
    if (project.subCoordinator?.userId === user.id) return true;
    
    return false;
  };

  // Função para remover colaborador
  const handleRemoveCollaborator = async (collaboratorId: number, collaboratorType: string) => {
    if (!project) return;
    
    if (!confirm("Tem certeza que deseja remover este colaborador?")) return;
    
    try {
      setLoadingAction(true);
      await projectService.removeCollaborator(project.id, collaboratorId, collaboratorType);
      
      // Recarregar os dados do projeto para atualizar a lista
      const updatedProject = await projectService.getById(project.id);
      setProject(updatedProject);
      
    } catch (error) {
      console.error("Erro ao remover colaborador:", error);
      alert("Erro ao remover colaborador. Tente novamente.");
    } finally {
      setLoadingAction(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProjectType = (tipo: string | undefined) => {
    const typeConfig = {
      'pesquisa': { 
        label: 'Pesquisa', 
        color: 'bg-blue-100 text-blue-800',
        description: 'Projeto de Pesquisa'
      },
      'extensao': { 
        label: 'Extensão', 
        color: 'bg-green-100 text-green-800',
        description: 'Projeto de Extensão'
      },
      'misto': { 
        label: 'Pesquisa e Extensão', 
        color: 'bg-purple-100 text-purple-800',
        description: 'Projeto de Pesquisa e Extensão'
      }
    };
    
    return typeConfig[tipo as keyof typeof typeConfig] || typeConfig.pesquisa;
  };

  const handleShare = async () => {
    if (navigator.share && project) {
      try {
        await navigator.share({
          title: project.title,
          text: project.details,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback: copiar URL para clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Carregando projeto...</span>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <header className="bg-[#003366] text-white shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <img
                  src={brasaoBrancoHorizontal}
                  className="h-14 w-28 object-contain"
                  alt="Logo UFC"
                />
                <div>
                  <h1 className="text-xl font-bold">Academium UFC</h1>
                  <p className="text-sm text-blue-200">Detalhes do Projeto</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => navigate("/projetos")}
                  variant="outline"
                  className="bg-transparent border-white text-white hover:bg-white hover:text-[#003366]"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Projeto não encontrado</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => navigate("/projetos")}>
              Voltar para Projetos
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="bg-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img
                src={brasaoBrancoHorizontal}
                className="h-14 w-28 object-contain cursor-pointer"
                alt="Logo UFC"
                onClick={() => navigate("/")}
              />
              <nav className="hidden md:flex items-center space-x-8">
                <Button
                  variant="ghost"
                  onClick={() => window.history.back()}
                  className="text-white hover:text-blue-200 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </Button>
                <a
                  onClick={() => navigate("/")}
                  className="text-sm hover:text-blue-200 transition-colors cursor-pointer"
                >
                  Início
                </a>
                <a
                  onClick={() => navigate("/projetos")}
                  className="text-sm hover:text-blue-200 transition-colors cursor-pointer"
                >
                  Projetos
                </a>
                <a
                  onClick={() => navigate("/perfis-publicos")}
                  className="text-sm hover:text-blue-200 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Users className="w-4 h-4" />
                  Perfis
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <UserMenu />
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => navigate("/login")} className="bg-white text-[#003366] hover:bg-gray-100">
                    Entrar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate("/cadastro")} className="bg-white text-[#003366] hover:bg-gray-100">
                    Cadastrar
                  </Button>
                </div>
              )}
              <Button
                onClick={handleShare}
                variant="outline"
                size="sm"
                className="bg-transparent border-white text-white hover:bg-white hover:text-blue-900"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-blue-600 mb-4">
            <BookOpen className="w-4 h-4" />
            <span>{getProjectType(project.tipo).description}</span>
            <span className="text-gray-400">•</span>
            <span>UFC</span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {project.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                {project.area}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className={`px-3 py-1 rounded-full font-medium ${getProjectType(project.tipo).color}`}>
                {getProjectType(project.tipo).label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Criado em {formatDate(project.createdAt)}</span>
            </div>
            {project.updatedAt !== project.createdAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Atualizado em {formatDate(project.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Project Details */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-blue-100">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Sobre o Projeto
                </h2>
                <div className="prose prose-blue max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                    {project.details}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Project Objectives */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-blue-100">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Objetivos e Metas
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <p className="text-gray-700">
                      Desenvolver soluções inovadoras na área de {project.area}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <p className="text-gray-700">
                      Contribuir para o avanço científico e tecnológico da universidade
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <p className="text-gray-700">
                      Formar estudantes e pesquisadores especializados
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <p className="text-gray-700">
                      Produzir conhecimento aplicável à sociedade
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Collaborators Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-blue-100">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-6 h-6" />
                    Colaboradores
                  </h2>
                </div>
                
                {project.collaborators && project.collaborators.length > 0 ? (
                  <div className="space-y-4">
                    {project.collaborators.map((collaborator) => (
                      <div key={collaborator.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{collaborator.user.name}</h3>
                          <p className="text-sm text-gray-600">{collaborator.user.email}</p>
                          <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {collaborator.type === 'docente' ? 'Docente' : 
                             collaborator.type === 'discente' ? 'Discente' : 
                             collaborator.type === 'servidor' ? 'Servidor' : 'Externo'}
                          </span>
                        </div>
                        {canManageProject() && (
                          <Button
                            onClick={() => handleRemoveCollaborator(collaborator.id, collaborator.type)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={loadingAction}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum colaborador cadastrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Project Info */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-blue-100">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Informações do Projeto
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Coordenador</p>
                    <p className="text-gray-900">{project.coordinator?.user?.name || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Tipo de Projeto</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getProjectType(project.tipo).color}`}>
                      {getProjectType(project.tipo).label}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Área de Pesquisa</p>
                    <p className="text-gray-900">{project.area}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                    <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Ativo
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Data de Criação</p>
                    <p className="text-gray-900">{formatDate(project.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Última Atualização</p>
                    <p className="text-gray-900">{formatDate(project.updatedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-blue-100">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Ações Rápidas
                </h3>
                <div className="space-y-3">
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar Projeto
                  </Button>
                  <Button
                    onClick={() => navigate("/projetos")}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Ver Todos os Projetos
                  </Button>
                  {user?.type === 'admin' && (
                    <Button
                      onClick={() => navigate("/admin")}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Gerenciar no Admin
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="bg-blue-50 border border-blue-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-4">
                  Interessado no Projeto?
                </h3>
                <p className="text-blue-800 text-sm mb-4">
                  Entre em contato conosco para saber mais sobre oportunidades de pesquisa e colaboração.
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Entrar em Contato
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#003366] text-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-blue-200">
            © 2025 Universidade Federal do Ceará - Campus Itapajé
          </p>
        </div>
      </footer>
    </div>
  );
}