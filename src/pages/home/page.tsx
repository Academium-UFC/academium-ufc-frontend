import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import api from '@/lib/api';

// Importações das imagens
import Andsu from '@/assets/img/andsu.jpg';
import Israel from '@/assets/img/israel.jpg';

// Interfaces
interface InstitutionalCoordinator {
  id: number;
  name: string;
  email: string;
  area_atuacao?: string;
  coordenador_institucional?: {
    tipo: 'pesquisa' | 'extensao';
  };
}

interface ProjectCoordinator {
  userId: number;
  name: string;
  email: string;
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
  coordinator?: {
    id: number;
    name: string;
    email: string;
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
        const projectsResponse = await api.get('/projects');
        const allProjects = projectsResponse.data;
        
        // Pega os projetos aprovados com imagens para o carrossel (máximo 5)
        // Filtra apenas projetos de pesquisa, extensão ou mistos
        const featured = allProjects
          .filter((project: Project) => 
            project.status === 'approved' && 
            project.imageUrl &&
            (project.tipo === 'pesquisa' || project.tipo === 'extensao' || project.tipo === 'misto')
          )
          .sort((a: Project, b: Project) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        setFeaturedProjects(featured);
      } catch (error) {
        console.error("Erro ao carregar projetos recentes:", error);
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
        
        // Buscar coordenadores institucionais (pesquisa e extensão)
        const profilesResponse = await api.get('/profile');
        const allProfiles = profilesResponse.data;
        
        const institutionalCoords = allProfiles.filter((profile: InstitutionalCoordinator) => 
          profile.coordenador_institucional && 
          (profile.coordenador_institucional.tipo === 'pesquisa' || 
           profile.coordenador_institucional.tipo === 'extensao')
        );
        
        setInstitutionalCoordinators(institutionalCoords);
        
        // Buscar projetos para encontrar coordenadores de projetos
        const projectsResponse = await api.get('/projects');
        const allProjects = projectsResponse.data;
        
        // Filtrar apenas projetos aprovados
        const approvedProjects = allProjects.filter((project: Project) => project.status === 'approved');
        
        // Agrupar projetos por coordenador
        const coordinatorMap = new Map<number, ProjectCoordinator>();
        
        approvedProjects.forEach((project: Project) => {
          if (project.coordinator) {
            const userId = project.coordinator.id;
            if (!coordinatorMap.has(userId)) {
              coordinatorMap.set(userId, {
                userId: userId,
                name: project.coordinator.name,
                email: project.coordinator.email,
                mostRecentProject: { title: project.title }
              });
            } else {
              // Atualizar com o projeto mais recente se for mais novo
              const existingCoord = coordinatorMap.get(userId);
              const existingProjectDate = approvedProjects.find((p: Project) => p.title === existingCoord?.mostRecentProject?.title)?.createdAt;
              if (!existingProjectDate || new Date(project.createdAt) > new Date(existingProjectDate)) {
                coordinatorMap.set(userId, {
                  ...existingCoord!,
                  mostRecentProject: { title: project.title }
                });
              }
            }
          }
        });
        
        // Ordenar coordenadores por projeto mais recente
        const projectCoords = Array.from(coordinatorMap.values())
          .sort((a, b) => {
            const projectA = approvedProjects.find((p: Project) => p.title === a.mostRecentProject?.title);
            const projectB = approvedProjects.find((p: Project) => p.title === b.mostRecentProject?.title);
            if (!projectA || !projectB) return 0;
            return new Date(projectB.createdAt).getTime() - new Date(projectA.createdAt).getTime();
          })
          .slice(0, 8); // Limitar a 8 coordenadores mais recentes
        
        setProjectCoordinators(projectCoords);
        
      } catch (error) {
        console.error('Erro ao carregar coordenadores:', error);
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
      <section className="bg-[#003366] text-white py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Pesquisa e Extensão na UFC Itapajé
              </h1>
              <p className="text-lg text-blue-100 mb-8 leading-relaxed">
                Conheça os projetos de pesquisa e extensão desenvolvidos no
                campus da UFC em Itapajé, promovendo conhecimento e impacto
                social na região.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="w-80 h-80 bg-gradient-to-br from-blue-400/20 to-blue-600/30 rounded-2xl flex items-center justify-center border border-blue-400/30">
                <div className="text-8xl opacity-80">🎓</div>
              </div>
            </div>
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
                    <div className="w-40 h-40 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto shadow-lg flex items-center justify-center">
                      <span className="text-white text-4xl font-bold">
                        {coordinator.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </span>
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="text-2xl font-bold mb-3 text-gray-800 hover:text-blue-600 transition-colors">
                        {coordinator.name}
                      </h3>
                      <p className="text-[#003366] mb-2 font-medium">
                        Coordenador de {coordinator.coordenador_institucional?.tipo === 'pesquisa' ? 'Pesquisa' : 'Extensão'}
                      </p>
                      <p className="text-gray-600 mb-2">{coordinator.area_atuacao || 'Área de atuação não informada'}</p>
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
              // Fallback para dados estáticos se não houver dados da API
              <>
                {/* Coordenador de Pesquisa */}
                <div className="grid md:grid-cols-2 gap-12 items-center mb-8">
                  <img
                    src={Andsu}
                    alt="Anderson Gonçalves Uchôa"
                    className="w-40 h-40 object-cover rounded-full mx-auto shadow-lg"
                  />
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-bold mb-3 text-gray-800">
                      Anderson Gonçalves Uchôa
                    </h3>
                    <p className="text-[#003366] mb-2 font-medium">
                      Coordenador de Pesquisa
                    </p>
                    <p className="text-gray-600">E-mail: andersonuchoua@ufc.br</p>
                  </div>
                </div>

                {/* Linha separadora */}
                <div className="border-t border-gray-200 my-8"></div>

                {/* Coordenador de Extensão */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <img
                    src={Israel}
                    alt="Israel Eduardo Barros Filho"
                    className="w-40 h-40 object-cover rounded-full mx-auto shadow-lg"
                  />
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-bold mb-3 text-gray-800">
                      Israel Eduardo Barros Filho
                    </h3>
                    <p className="text-[#003366] mb-2 font-medium">
                      Coordenador de Extensão
                    </p>
                    <p className="text-gray-600">E-mail: israel.barros@ufc.br</p>
                  </div>
                </div>
              </>
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
                          navigate(`/profile/public/${coordinator.userId}`);
                        }}
                        style={{ zIndex: 10, minHeight: '150px' }}
                      >
                        <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto flex items-center justify-center">
                          <span className="text-white text-2xl font-bold">
                            {coordinator.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-2 hover:text-blue-600 transition-colors">
                            {coordinator.name}
                          </h3>
                          <p className="text-sm text-[#003366] font-medium mb-1">
                            Projeto recente: {coordinator.mostRecentProject?.title || 'Nenhum projeto'}
                          </p>
                          <p className="text-sm text-gray-500 mb-2">
                            E-mail: {coordinator.email}
                          </p>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/profile/public/${coordinator.userId}`);
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
                      <p className="text-gray-600 leading-relaxed">
                        {project.details.length > 120 ? `${project.details.substring(0, 120)}...` : project.details}
                      </p>
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
