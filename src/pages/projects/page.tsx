import { Search, Menu, Plus, Trash2, ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Pagination } from "@/components/ui/pagination";
import { LoadingCard } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import brasaoBrancoHorizontal from "../../assets/img/brasao-branco-horizontal.png";
import { projectService, type Project } from "@/lib/api";
import { useAuth } from "@/lib/use-auth";
import { UserMenu } from "@/components/ui/user-menu";

export default function Projects() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState("");
  const [projectType, setProjectType] = useState("");

  // Areas serão carregadas dinamicamente dos projetos existentes
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);

  // Carrega projetos da API - APENAS APROVADOS
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const filters = {
          ...(searchTerm && { search: searchTerm }),
          ...(areaFilter && { area: areaFilter }),
          ...(typeFilter && { type: typeFilter })
        };
        const data = await projectService.getApproved(filters);
        setProjects(data);
        
        // Extrair áreas únicas dos projetos carregados
        const uniqueAreas = [...new Set(data.map((project: Project) => project.area))];
        setAvailableAreas(uniqueAreas.sort());
        
        // Reset para página 1 quando filtros mudam
        setCurrentPage(1);
        
      } catch (error) {
        console.error("Erro ao carregar projetos:", error);
        setError("Erro ao carregar projetos. Verifique se o servidor está rodando.");
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [searchTerm, areaFilter, typeFilter]);

  // Cálculos de paginação
  const totalPages = Math.ceil(projects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProjects = projects.slice(startIndex, endIndex);

  const handleAddProject = async () => {
    if (!title.trim() || !description.trim() || !area.trim() || !projectType.trim()) {
      alert("Por favor, preencha todos os campos");
      return;
    }

    try {
      const newProject = await projectService.create({
        title: title.trim(),
        details: description.trim(),
        area: area.trim(),
        tipo: projectType as 'pesquisa' | 'extensao' | 'misto',
      });
      
      // Atualiza a lista de projetos
      setProjects([...projects, newProject.project]);
      
      // Limpa o formulário e fecha o diálogo
      setTitle("");
      setDescription("");
      setArea("");
      setProjectType("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao criar projeto:", error);
      alert("Erro ao criar projeto. Tente novamente.");
    }
  };

  const removeProject = async (id: number) => {
    if (!confirm("Tem certeza que deseja remover este projeto?")) {
      return;
    }

    try {
      await projectService.delete(id);
      setProjects(projects.filter((project: Project) => project.id !== id));
    } catch (error) {
      console.error("Erro ao remover projeto:", error);
      alert("Erro ao remover projeto. Tente novamente.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img
                src={brasaoBrancoHorizontal}
                className="h-14 w-28 object-contain"
                alt="Logo UFC"
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
                  className="text-sm text-blue-200 transition-colors cursor-pointer"
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
                {user?.type === 'admin' && (
                  <a
                    onClick={() => navigate("/admin")}
                    className="text-sm hover:text-blue-200 transition-colors cursor-pointer"
                  >
                    Admin
                  </a>
                )}
                {isAuthenticated && (
                  <a
                    onClick={() => navigate("/perfil")}
                    className="text-sm hover:text-blue-200 transition-colors cursor-pointer"
                  >
                    Perfil
                  </a>
                )}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="md:hidden text-white">
                <Menu className="h-5 w-5" />
              </Button>
              {isAuthenticated && (
                <UserMenu />
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="bg-blue-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Vitrine de Projetos de Pesquisas
              </h1>
              <p className="text-lg text-blue-100 mb-8 leading-relaxed">
                A vitrine de projetos de pesquisa é um espaço dedicado à
                divulgação dos trabalhos científicos desenvolvidos na
                universidade, promovendo a visibilidade e o compartilhamento do
                conhecimento produzido em diversas áreas do saber.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="relative w-80 h-80 bg-blue-800 rounded-full flex items-center justify-center">
                <div className="text-6xl">🔬</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar projetos de pesquisa..."
                className="pl-10 h-12 text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Filtros */}
            <div className="flex gap-4 flex-wrap">
              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas as áreas</option>
                {availableAreas.map((areaOption) => (
                  <option key={areaOption} value={areaOption}>
                    {areaOption}
                  </option>
                ))}
              </select>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os tipos</option>
                <option value="pesquisa">Pesquisa</option>
                <option value="extensao">Extensão</option>
                <option value="misto">Pesquisa e Extensão</option>
              </select>
              
              {areaFilter || typeFilter ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setAreaFilter("");
                    setTypeFilter("");
                  }}
                >
                  Limpar Filtros
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <main className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Vitrine de Pesquisa
            </h2>
            <h3 className="text-2xl font-semibold text-blue-900 mb-2">
              Campus Itapajé
            </h3>
            <p className="text-lg text-gray-600">
              Principais Projetos de Pesquisa - Campus UFC Itapajé
            </p>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-2xl font-bold text-gray-900">
                Pesquisa ({projects.length} projetos)
              </h4>
              {isAuthenticated && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" /> Adicionar Projeto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md w-full">
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold">Novo Projeto</h2>
                      <Input
                        placeholder="Título do projeto"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                      <Textarea
                        placeholder="Descrição do projeto"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                      />
                      <Input
                        placeholder="Área do projeto (ex: Tecnologia, Educação, Saúde)"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                      />
                      <select
                        value={projectType}
                        onChange={(e) => setProjectType(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Selecione o tipo do projeto</option>
                        <option value="pesquisa">Pesquisa</option>
                        <option value="extensao">Extensão</option>
                        <option value="misto">Pesquisa e Extensão</option>
                      </select>
                      <div className="flex gap-2">
                        <Button onClick={handleAddProject} className="flex-1">
                          Criar Projeto
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsDialogOpen(false)}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array(8).fill(0).map((_, index) => (
                  <LoadingCard key={index} />
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm ? "Nenhum projeto encontrado" : "Nenhum projeto cadastrado"}
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? "Tente buscar por outros termos" 
                    : "Seja o primeiro a adicionar um projeto!"}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {paginatedProjects.map((project) => (
                    <Card
                      key={project.id}
                      className="bg-white border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer group relative overflow-hidden"
                      onClick={() => navigate(`/projetos/${project.id}`)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <CardContent className="p-6 relative z-10">
                        <div className="flex flex-col space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
                              <span className="text-blue-600 font-bold text-lg">
                                {project.title.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            {isAuthenticated && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeProject(project.id);
                                }}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          
                          <div>
                            <h5 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                              {project.title}
                            </h5>
                            <Badge variant="default" className="mb-2">
                              {project.area}
                            </Badge>
                            <Badge 
                              variant={project.tipo === 'pesquisa' ? 'success' : 
                                     project.tipo === 'extensao' ? 'warning' : 'secondary'} 
                              className="mb-3 ml-2"
                            >
                              {project.tipo === 'pesquisa' ? 'Pesquisa' : 
                               project.tipo === 'extensao' ? 'Extensão' : 
                               project.tipo === 'misto' ? 'Pesquisa e Extensão' : 'Não especificado'}
                            </Badge>
                            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                              {project.details}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-500">
                              Criado em: {formatDate(project.createdAt)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      className="bg-white p-4 rounded-lg shadow-sm border"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-blue-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <img
              src={brasaoBrancoHorizontal}
              className="h-14 w-28 object-contain"
              alt="Logo UFC"
            />
            <div className="text-right">
              <p className="text-sm text-blue-200">
                © 2025 Universidade Federal do Ceará. Todos os direitos
                reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}