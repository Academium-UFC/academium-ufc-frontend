import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import brasaoBrancoHorizontal from "../../assets/img/brasao-branco-horizontal.png";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "../../components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { projectService, profileService, type Project, type PublicProfileSummary } from "@/lib/api";
import Joao from "../../assets/img/jao.jpg";
import Andsu from "../../assets/img/andsu.jpg";
import Israel from "../../assets/img/israel.jpg";
import Julio from "../../assets/img/julio.jpg";
import Fenner from "../../assets/img/fenner.jpg";

type ProjectCoordinator = {
  id: number;
  userId: number;
  name: string;
  email: string;
  type: string;
  projects: Project[];
  mostRecentProject?: Project;
};

export default function Home() {
  const navigate = useNavigate();
  
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [institutionalCoordinators, setInstitutionalCoordinators] = useState<PublicProfileSummary[]>([]);
  const [projectCoordinators, setProjectCoordinators] = useState<ProjectCoordinator[]>([]);
  const [loadingCoordinators, setLoadingCoordinators] = useState(true);

  // Carrega os projetos mais recentes e em destaque
  useEffect(() => {
    const loadRecentProjects = async () => {
      try {
        const projects = await projectService.getAll();
        
        // Pega os projetos aprovados com imagens para o carrossel (máximo 5)
        const featured = projects
          .filter(project => project.status === 'approved' && project.imageUrl)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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

  // Carrega coordenadores institucionais e coordenadores de projetos
  useEffect(() => {
    const loadCoordinators = async () => {
      try {
        setLoadingCoordinators(true);
        
        // Carregar perfis públicos
        const profiles = await profileService.getPublicProfiles();
        
        // Filtrar coordenadores institucionais
        const institutional = profiles.filter(profile => 
          profile.coordenador_institucional?.ativo
        );
        setInstitutionalCoordinators(institutional);
        
        // Carregar todos os projetos para encontrar coordenadores ativos
        const projects = await projectService.getAll();
        const activeProjects = projects.filter(project => project.status === 'approved');
        
        // Agrupar projetos por coordenador (ID do usuário)
        const coordinatorsMap = new Map<number, ProjectCoordinator>();
        
        activeProjects.forEach(project => {
          if (project.coordinator) {
            const coordinatorUserId = project.coordinator.userId; // ID do usuário
            if (!coordinatorsMap.has(coordinatorUserId)) {
              coordinatorsMap.set(coordinatorUserId, {
                id: project.coordinator.id, // ID do relacionamento coordenador
                userId: coordinatorUserId, // ID do usuário para navegação
                name: project.coordinator.user.name,
                email: project.coordinator.user.email,
                type: 'docente', // tipo padrão, pois não está na estrutura
                projects: []
              });
            }
            coordinatorsMap.get(coordinatorUserId)?.projects.push(project);
          }
        });
        
        // Converter para array e ordenar por projeto mais recente
        const coordinatorsList = Array.from(coordinatorsMap.values()).map(coordinator => ({
          ...coordinator,
          mostRecentProject: coordinator.projects
            .sort((a: Project, b: Project) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
        }));
        
        // Incluir coordenadores institucionais que também são coordenadores de projetos
        // mas garantir que tenham pelo menos um projeto para aparecer na lista
        const allCoordinators = coordinatorsList.filter(coord => coord.projects.length > 0);
        
        setProjectCoordinators(allCoordinators);
        
      } catch (error) {
        console.error("Erro ao carregar coordenadores:", error);
      } finally {
        setLoadingCoordinators(false);
      }
    };

    loadCoordinators();
  }, []);

  const idealizadores = [
    {
      nome: "João Henrique Gonçalves Corrêa",
      foto: Joao,
      area: "Professor Adjunto",
      email: "joaocorrea@ufc.br",
    },
    {
      nome: "Anderson Gonçalves Uchôa",
      foto: Andsu,
      area: "Professor Adjunto",
      email: "andersonuchoua@ufc.br",
    },
    {
      nome: "Julio César Santos dos Anjos",
      foto: Julio,
      area: "Professor Adjunto",
      email: "jcsanjos@ufc.br",
    },
    {
      nome: "Germano Fenner ",
      foto: Fenner,
      area: "Professor Adjunto",
      email: "germano.fenner@ufc.br",
    },
    {
      nome: "Israel Eduardo Barros Filho",
      foto: Israel,
      area: "Professor Adjunto",
      email: "israel.barros@ufc.br",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-[#003366] text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img
                src={brasaoBrancoHorizontal}
                className="h-14 w-28 object-contain"
                alt="Logo UFC"
              />
              <nav className="hidden md:flex items-center space-x-8">
                <a
                  href="#"
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
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Encontre o que você procura"
                  className="pl-4 pr-4 py-2 rounded-lg text-black text-sm placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-blue-300 shadow-sm w-64"
                />
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="w-10 h-10 rounded-full bg-white text-[#003366] flex items-center justify-center text-lg font-bold shadow-sm hover:shadow-md transition-shadow">
                    👤
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Bem-vindo(a)</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-4 mt-4">
                    <Button
                      onClick={() => navigate("/login")}
                      className="bg-[#003366] text-white hover:bg-[#002244]"
                    >
                      Fazer Login
                    </Button>
                    <Button
                      onClick={() => navigate("/cadastro")}
                      className="bg-[#003366] text-white hover:bg-[#002244]"
                    >
                      Cadastre-se
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Carrossel de Banners de Projetos */}
      <section className="bg-[#004080] text-white">
        {loadingProjects ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-blue-100">Carregando projetos em destaque...</p>
            </div>
          </div>
        ) : featuredProjects.length > 0 ? (
          <Carousel className="w-full">
            <CarouselContent>
              {featuredProjects.map((project) => (
                <CarouselItem key={project.id}>
                  <div className="relative h-96 flex items-center">
                    {/* Imagem de fundo */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                      style={{
                        backgroundImage: `linear-gradient(rgba(0, 64, 128, 0.7), rgba(0, 64, 128, 0.7)), url(${project.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzNzNkYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbSBkbyBQcm9qZXRvPC90ZXh0Pjwvc3ZnPg=='})`
                      }}
                    />
                    
                    {/* Conteúdo sobreposto */}
                    <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                      <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                        {project.title}
                      </h1>
                      <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
                        {project.details.length > 150 
                          ? `${project.details.substring(0, 150)}...` 
                          : project.details
                        }
                      </p>
                      <div className="flex justify-center gap-4">
                        <Button 
                          onClick={() => navigate(`/projetos/${project.id}`)}
                          className="bg-white text-[#004080] hover:bg-gray-100 font-semibold px-10 py-3 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all"
                        >
                          Ver projeto
                        </Button>
                        <Button 
                          onClick={() => navigate("/projetos")}
                          variant="outline"
                          className="bg-transparent border-white text-white hover:bg-white hover:text-[#004080] font-semibold px-10 py-3 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all"
                        >
                          Ver todos
                        </Button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4 bg-white/20 border-white/30 text-white hover:bg-white/30" />
            <CarouselNext className="right-4 bg-white/20 border-white/30 text-white hover:bg-white/30" />
          </Carousel>
        ) : (
          // Fallback quando não há projetos com imagens
          <div className="container mx-auto px-4 py-20 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Bem-vindo ao Academium UFC
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Descubra os projetos de pesquisa e extensão da nossa comunidade acadêmica
              </p>
              <Button 
                onClick={() => navigate("/projetos")}
                className="bg-white text-[#004080] hover:bg-gray-100 font-semibold px-10 py-3 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                Explorar projetos
              </Button>
            </div>
          </div>
        )}
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Projetos recentes
            </h2>
            <p className="text-lg text-gray-600">
              Recente. Populares. Projetos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card
              onClick={() => navigate("/projetos/1")}
              className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md cursor-pointer"
            >
              <CardContent className="p-6">
                <div className="w-full h-48 bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
                  <img
                    src="data:image/jpeg;base64,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"
                    alt="AbacatePay"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-800">
                  AbacatePay
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  A AbacatePay é um gateway de pagamento digital voltado
                  especialmente para PIX, ideal para SaaS, micro‑SaaS,
                  indie‑hackers e pequenas empresas. A plataforma se destaca
                  pela simplicidade e rapidez na integração, com uma API
                  intuitiva e plug‑and‑play, além de suporte eficiente e
                  transparência em taxas
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

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
                      console.log('Card clicado - coordenador institucional:', coordinator.id);
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
                          console.log('Botão clicado:', coordinator.id);
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
            {projectCoordinators.length > 0 ? (
              <Carousel>
                <CarouselContent>
                  {projectCoordinators.map((coordinator, i) => (
                    <CarouselItem key={i} className="p-4">
                      <div 
                        className="grid md:grid-cols-2 items-center gap-8 bg-white p-6 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors relative"
                        onClick={(e) => {
                          e.preventDefault();
                          console.log('Card clicado - coordenador de projeto:', coordinator.userId);
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
                              console.log('Botão de projeto clicado:', coordinator.userId);
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
            ) : loadingCoordinators ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando coordenadores de projetos...</p>
              </div>
            ) : (
              // Fallback para dados estáticos se não houver dados da API
              <Carousel>
                <CarouselContent>
                  {idealizadores.map((idealizador, i) => (
                    <CarouselItem key={i} className="p-4">
                      <div className="grid md:grid-cols-2 items-center gap-8 bg-white p-6 rounded-xl ">
                        <img
                          src={idealizador.foto}
                          alt={idealizador.nome}
                          className="w-32 h-32 object-cover rounded-full mx-auto "
                        />
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-2">
                            {idealizador.nome}
                          </h3>
                          <p className="text-sm text-[#003366] font-medium mb-1">
                            Área: {idealizador.area}
                          </p>
                          <p className="text-sm text-gray-500">
                            E-mail: {idealizador.email}
                          </p>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="bg-white shadow-md hover:bg-gray-50" />
                <CarouselNext className="bg-white shadow-md hover:bg-gray-50" />
              </Carousel>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Nosso campus
            </h2>
            <p className="text-lg text-gray-600">
              Conheça mais sobre nossa estrutura
            </p>
          </div>
          <div className="relative aspect-video bg-gray-200 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform cursor-pointer">
              <div className="w-10 h-10 bg-[#003366] rounded-full flex items-center justify-center">
                <div className="w-0 h-0 border-l-4 border-l-white border-y-2 border-y-transparent ml-1"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Localização
            </h2>
          </div>
          <div className="w-full h-80 bg-gray-200 rounded-xl shadow-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#003366] rounded-full mx-auto mb-4 flex items-center justify-center shadow-md">
                <span className="text-white text-2xl"></span>
              </div>
              <p className="text-gray-600 font-medium">
                Mapa interativo em breve
              </p>
            </div>
          </div>
        </div>
      </section>

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