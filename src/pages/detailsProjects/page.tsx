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
} from "lucide-react";
import { useState, useEffect } from "react";
import { projectService, type Project } from "@/lib/api";
import { useAuth } from "@/lib/use-auth";
import brasaoBrancoHorizontal from "../../assets/img/brasao-branco-horizontal.png";

export default function DetailsProjects() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
                onClick={handleShare}
                variant="outline"
                size="sm"
                className="bg-transparent border-white text-white hover:bg-white hover:text-[#003366]"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
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

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-blue-600 mb-4">
            <BookOpen className="w-4 h-4" />
            <span>Projeto de Pesquisa</span>
            <span className="text-gray-400">•</span>
            <span>UFC Itapajé</span>
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-blue-100">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Informações do Projeto
                </h3>
                <div className="space-y-4">
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