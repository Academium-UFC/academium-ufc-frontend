import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import brasaoBrancoHorizontal from "../../assets/img/brasao-branco-horizontal.png";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/use-auth";
import { UserMenu } from "@/components/ui/user-menu";

// Interfaces
interface InstitutionalCoordinator {
  id: number;
  name: string;
  email: string;
  area_atuacao?: string;
  foto_url?: string;
  coordenador_institucional?: {
    tipo: 'pesquisa' | 'extensao';
    ativo: boolean;
  };
  docente?: {
    area?: string;
  };
  servidor?: {
    cargo?: string;
  };
}

interface ProjectCoordinator {
  id: number;
  name: string;
  email: string;
  type: string;
  foto_url?: string;
  docente?: {
    area?: string;
  };
  servidor?: {
    cargo?: string;
  };
  mostRecentProject?: {
    title: string;
  } | null;
}

interface Project {
  id: number;
  title: string;
  userId: number;
  imageUrl?: string;
  details: string;
  status: string;
  tipo?: 'pesquisa' | 'extensao' | 'misto';
  createdAt: string;
  coordenador?: {
    id: number;
    user: {
      name: string;
      email: string;
    };
  };
}

export default function HomePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [institutionalCoordinators, setInstitutionalCoordinators] = useState<InstitutionalCoordinator[]>([]);
  const [projectCoordinators, setProjectCoordinators] = useState<ProjectCoordinator[]>([]);
  const [loadingCoordinators, setLoadingCoordinators] = useState(true);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Carrega os projetos mais recentes e em destaque
  useEffect(() => {
    const loadRecentProjects = async () => {
      try {
        // Usar a nova rota pública sem filtro de status
        const projectsResponse = await fetch('http://localhost:3000/api/v1/projects', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (projectsResponse.ok) {
          const response = await projectsResponse.json();
          const allProjects = response.projetos || response.projects || response;
          
          // Filtrar apenas projetos aprovados para o carrossel (máximo 5)
          const featured = allProjects
            .filter((project: Project) => 
              project.status === 'approved' && 
              (project.tipo === 'pesquisa' || project.tipo === 'extensao' || project.tipo === 'misto')
            )
            .sort((a: Project, b: Project) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);
          setFeaturedProjects(featured);
        } else {
          console.log("Não foi possível carregar projetos públicos");
          setFeaturedProjects([]);
        }
      } catch (error) {
        console.error("Erro ao carregar projetos recentes:", error);
        setFeaturedProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };

    loadRecentProjects();
  }, []);

  useEffect(() => {
    const fetchCoordinators = async () => {
      try {
        setLoadingCoordinators(true);
        
        // Buscar perfis públicos dos coordenadores institucionais
        const profilesResponse = await fetch('http://localhost:3000/api/v1/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (profilesResponse.ok) {
          const profilesData = await profilesResponse.json();
          const profiles = profilesData.profiles || profilesData;
          // Filtrar coordenadores institucionais
          const institutionalCoords = profiles.filter((profile: { coordenador_institucional?: { ativo: boolean } }) => 
            profile.coordenador_institucional?.ativo
          );
          setInstitutionalCoordinators(institutionalCoords);
        }

        // Buscar projetos aprovados para obter coordenadores de projetos
        const projectsResponse = await fetch('http://localhost:3000/api/v1/projects/approved', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (projectsResponse.ok) {
          const response = await projectsResponse.json();
          const allProjects = response.projetos || response.projects || response;
          
          console.log('Projects received:', allProjects.slice(0, 2)); // Debug log
          
          // Processar coordenadores de projetos recentes
          const coordinatorMap = new Map<number, ProjectCoordinator>();
          
          // Ordenar projetos por data de criação (mais recentes primeiro)
          const recentProjects = allProjects
            .sort((a: Project, b: Project) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10); // Pegar os 10 projetos mais recentes
          
          recentProjects.forEach((project: Project) => {
            console.log('Processing project:', project.title, 'Coordinator:', project.coordenador); // Debug log
            if (project.coordenador && project.coordenador.user) {
              const userId = project.coordenador.id;
              const userName = project.coordenador.user.name;
              const userEmail = project.coordenador.user.email;
              
              if (!coordinatorMap.has(userId)) {
                coordinatorMap.set(userId, {
                  id: userId,
                  name: userName,
                  email: userEmail,
                  type: 'docente',
                  mostRecentProject: { title: project.title }
                });
              }
            }
          });
          
          const projectCoords = Array.from(coordinatorMap.values()).slice(0, 8);
          console.log('Final coordinators:', projectCoords); // Debug log
          setProjectCoordinators(projectCoords);
        } else {
          // Se a API falhar, usar dados estáticos
          console.log("API não disponível para projetos, usando dados estáticos");
          setProjectCoordinators([]);
        }
        
      } catch (error) {
        console.error('Erro ao carregar coordenadores:', error);
        // Em caso de erro, continuar com arrays vazios (dados estáticos serão mostrados)
        setInstitutionalCoordinators([]);
        setProjectCoordinators([]);
      } finally {
        setLoadingCoordinators(false);
      }
    };

    fetchCoordinators();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#003366] text-white shadow-md relative z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <img
                src={brasaoBrancoHorizontal}
                className="h-14 w-28 object-contain cursor-pointer"
                alt="Logo UFC"
                onClick={() => navigate("/")}
              />
              <nav className="hidden md:flex items-center space-x-8">
                <a
                  onClick={() => navigate("/")}
                  className="text-sm hover:text-blue-200 transition-colors font-medium cursor-pointer"
                >
                  Início
                </a>
                <a
                  onClick={() => navigate("/projetos")}
                  className="text-sm hover:text-blue-200 transition-colors font-medium cursor-pointer"
                >
                  Projetos
                </a>
                <a
                  onClick={() => navigate("/perfis-publicos")}
                  className="text-sm hover:text-blue-200 transition-colors font-medium cursor-pointer flex items-center gap-1"
                >
                  <Users className="w-4 h-4" />
                  Perfis
                </a>
                {isAuthenticated && user?.type === 'admin' && (
                  <a
                    onClick={() => navigate("/admin")}  
                    className="text-sm hover:text-blue-200 transition-colors font-medium cursor-pointer"
                  >
                    Admin
                  </a>
                )}
                {isAuthenticated && (
                  <a
                    onClick={() => navigate("/perfil")}
                    className="text-sm hover:text-blue-200 transition-colors font-medium cursor-pointer"
                  >
                    Meu Perfil
                  </a>
                )}
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
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#003366] via-[#004080] to-[#002a5c] text-white py-20 px-6 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in-up">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Pesquisa e Extensão na UFC Itapajé
              </h1>
              <p className="text-lg text-blue-100 mb-8 leading-relaxed opacity-90">
                Conheça os projetos de pesquisa e extensão desenvolvidos no
                campus da UFC em Itapajé, promovendo conhecimento e impacto
                social na região.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-[#003366] hover:bg-blue-50 font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => navigate("/projetos")}
                >
                  Explorar Projetos
                </Button>
                <Button 
                  size="lg" 
                  className="bg-white text-[#003366] hover:bg-blue-50 font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => navigate("/perfis-publicos")}
                >
                  Ver Perfis
                </Button>
              </div>
            </div>
            <div className="flex justify-center animate-fade-in-right">
              <div className="relative">
                <div className="w-80 h-80 bg-gradient-to-br from-blue-400/20 to-blue-600/30 rounded-2xl flex items-center justify-center border border-blue-400/30 shadow-2xl backdrop-blur-sm hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:rotate-2">
                  <div className="text-8xl opacity-80 animate-bounce-slow">🎓</div>
                </div>
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
                <div className="absolute -bottom-6 -left-6 w-6 h-6 bg-blue-300 rounded-full animate-pulse delay-500"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projetos Recentes */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Projetos recentes</h2>
            <p className="text-lg text-gray-600">Recente. Populares. Projetos.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loadingProjects ? (
              <div className="col-span-3 text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando projetos recentes...</p>
              </div>
            ) : featuredProjects.length > 0 ? (
              featuredProjects.map((project) => {
                return (
                  <Card
                    key={project.id}
                    onClick={() => navigate(`/projetos/${project.id}`)}
                    className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md cursor-pointer"
                  >
                    <CardContent className="p-6">
                      <div className="w-full h-48 bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
                        {project.imageUrl ? (
                          <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-gray-400">Sem imagem</span>
                        )}
                      </div>
                      <h3 className="font-bold text-xl mb-3 text-gray-800">{project.title}</h3>
                      <div className="text-gray-600 leading-relaxed h-16 overflow-hidden relative">
                        <p className="text-sm">
                          {project.details}
                        </p>
                        {project.details.length > 120 && (
                          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent"></div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-3 text-center text-gray-500">Nenhum projeto recente encontrado.</div>
            )}
          </div>
        </div>
      </section>

      {/* Coordenadores Section */}
      <section className="py-20 bg-[#003366]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-white">
              Coordenadores
            </h2>
          </div>

          {/* Card dos Coordenadores de Pesquisa e Extensão */}
          <div className="bg-white rounded-xl p-8 shadow-lg mb-16">
            {institutionalCoordinators.length > 0 ? (
              institutionalCoordinators.map((coordinator, index) => (
                <div key={coordinator.id}>
                  <div 
                    className="grid md:grid-cols-2 gap-12 items-center cursor-pointer hover:bg-gray-50 p-4 rounded-lg transition-colors relative"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/profile/public/${coordinator.id}`);
                    }}
                    style={{ zIndex: 10, minHeight: '200px' }}
                  >
                    <div className="w-40 h-40 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto shadow-lg flex items-center justify-center overflow-hidden">
                      {coordinator.foto_url ? (
                        <img 
                          src={`http://localhost:3000${coordinator.foto_url}`}
                          alt={coordinator.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-4xl font-bold">
                          {coordinator.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </span>
                      )}
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="text-2xl font-bold mb-3 text-gray-800 hover:text-blue-600 transition-colors">
                        {coordinator.name}
                      </h3>
                      <p className="text-[#003366] mb-2 font-medium">
                        Coordenador de {coordinator.coordenador_institucional?.tipo === 'pesquisa' ? 'Pesquisa' : 'Extensão'}
                      </p>
                      <p className="text-gray-600 mb-2">
                        {coordinator.docente?.area || coordinator.servidor?.cargo || coordinator.area_atuacao || 'Área/Cargo não informada'}
                      </p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/profile/public/${coordinator.id}`);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 bg-transparent border-none cursor-pointer"
                      >
                        Ver perfil completo →
                      </button>
                    </div>
                  </div>
                  {index < institutionalCoordinators.length - 1 && (
                    <div className="border-t border-gray-200 my-8"></div>
                  )}
                </div>
              ))
            ) : loadingCoordinators ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando coordenadores...</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Nenhum coordenador institucional encontrado.</p>
              </div>
            )}
          </div>

          {/* Seção dos Coordenadores de Projetos */}
          <div className="text-center mb-8 mt-16">
            <h2 className="text-2xl font-bold mb-4 text-white">
              Coordenadores de Projetos
            </h2>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            {loadingCoordinators ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando coordenadores de projetos...</p>
              </div>
            ) : projectCoordinators.length > 0 ? (
              <Carousel>
                <CarouselContent>
                  {projectCoordinators.map((coordinator, i) => (
                    <CarouselItem key={i} className="p-4">
                      <div 
                        className="grid md:grid-cols-2 items-center gap-8 bg-white p-6 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors relative"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/profile/public/${coordinator.id}`);
                        }}
                        style={{ zIndex: 10, minHeight: '150px' }}
                      >
                        <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto flex items-center justify-center overflow-hidden">
                          {coordinator.foto_url ? (
                            <img 
                              src={`http://localhost:3000${coordinator.foto_url}`}
                              alt={coordinator.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white text-2xl font-bold">
                              {coordinator.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-2 hover:text-blue-600 transition-colors">
                            {coordinator.name}
                          </h3>
                          <p className="text-sm text-[#003366] font-medium mb-1">
                            {coordinator.type === 'docente' ? 
                              (coordinator.docente?.area ? `Área: ${coordinator.docente.area}` : 'Docente') : 
                              (coordinator.servidor?.cargo ? `Cargo: ${coordinator.servidor.cargo}` : 'Servidor')
                            }
                          </p>
                          <p className="text-sm text-gray-600 font-medium mb-1">
                            Projeto recente: {coordinator.mostRecentProject?.title || 'Nenhum projeto'}
                          </p>
                          <p className="text-sm text-gray-500 mb-2">
                            E-mail: {coordinator.email}
                          </p>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/profile/public/${coordinator.id}`);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 bg-transparent border-none cursor-pointer"
                          >
                            Ver perfil completo →
                          </button>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="bg-white shadow-md hover:bg-gray-50" />
                <CarouselNext className="bg-white shadow-md hover:bg-gray-50" />
              </Carousel>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Nenhum coordenador de projeto encontrado.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Nosso Campus */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Nosso campus</h2>
            <p className="text-lg text-gray-600">Conheça mais sobre nossa estrutura</p>
          </div>
          <div className="relative aspect-video bg-gray-200 rounded-xl shadow-lg overflow-hidden">
            {/* Placeholder para vídeo - substitua 'campus-video.mp4' pelo arquivo real */}
            <video 
              className="w-full h-full object-cover"
              controls
              poster="/src/assets/img/brasao-cor-vertical.png" /* Imagem de preview antes de reproduzir */
            >
              <source src="/src/assets/videos/campus-video.mp4" type="video/mp4" />
              <source src="/src/assets/videos/campus-video.webm" type="video/webm" />
              {/* Fallback para navegadores que não suportam vídeo */}
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl mb-4">
                    <div className="w-10 h-10 bg-[#003366] rounded-full flex items-center justify-center">
                      <div className="w-0 h-0 border-l-4 border-l-white border-y-2 border-y-transparent ml-1"></div>
                    </div>
                  </div>
                  <p className="text-gray-600">Seu navegador não suporta vídeos HTML5</p>
                </div>
              </div>
            </video>
          </div>
        </div>
      </section>

      {/* Localização */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Localização</h2>
          </div>
          <div className="w-full h-80 bg-gray-200 rounded-xl shadow-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#003366] rounded-full mx-auto mb-4 flex items-center justify-center shadow-md">
                <span className="text-white text-2xl"></span>
              </div>
              <p className="text-gray-600 font-medium">Mapa interativo em breve</p>
            </div>
          </div>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="bg-[#003366] text-white py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-4 text-lg font-medium">
            © 2025 Universidade Federal do Ceará - Campus Itapajé
          </div>
        </div>
      </footer>
    </div>
  );
}
