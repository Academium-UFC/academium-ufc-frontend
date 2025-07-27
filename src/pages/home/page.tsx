import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import api from '@/lib/api';

// Importações das imagens
import Andsu from '@/assets/img/andsu.jpg';
import Israel from '@/assets/img/israel.jpg';
import Fenner from '@/assets/img/fenner.jpg';
import Jao from '@/assets/img/jao.jpg';
import Julio from '@/assets/img/julio.jpg';

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
  coordinator?: {
    id: number;
    name: string;
    email: string;
  };
}

const idealizadores = [
  {
    nome: 'Anderson Gonçalves Uchôa',
    cargo: 'Coordenador de Pesquisa',
    email: 'andersonuchoua@ufc.br',
    foto: Andsu,
  },
  {
    nome: 'Israel Eduardo Barros Filho',
    cargo: 'Coordenador de Extensão',
    email: 'israel.barros@ufc.br',
    foto: Israel,
  },
  {
    nome: 'Fenner Lopes',
    cargo: 'Desenvolvedor Frontend',
    email: 'fenner.lopes@ufc.br',
    foto: Fenner,
  },
  {
    nome: 'João Victor',
    cargo: 'Desenvolvedor Backend',
    email: 'joao.victor@ufc.br',
    foto: Jao,
  },
  {
    nome: 'Júlio Albuquerque',
    cargo: 'DevOps Engineer',
    email: 'julio.albuquerque@ufc.br',
    foto: Julio,
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [institutionalCoordinators, setInstitutionalCoordinators] = useState<InstitutionalCoordinator[]>([]);
  const [projectCoordinators, setProjectCoordinators] = useState<ProjectCoordinator[]>([]);
  const [loadingCoordinators, setLoadingCoordinators] = useState(true);

  useEffect(() => {
    const fetchCoordinators = async () => {
      try {
        setLoadingCoordinators(true);
        
        // Buscar coordenadores institucionais (pesquisa e extensão)
        const profilesResponse = await api.get('/profile');
        const allProfiles = profilesResponse.data;
        console.log('Profiles carregados:', allProfiles);
        
        const institutionalCoords = allProfiles.filter((profile: InstitutionalCoordinator) => 
          profile.coordenador_institucional && 
          (profile.coordenador_institucional.tipo === 'pesquisa' || 
           profile.coordenador_institucional.tipo === 'extensao')
        );
        
        setInstitutionalCoordinators(institutionalCoords);
        
        // Buscar projetos para encontrar coordenadores de projetos
        const projectsResponse = await api.get('/projects');
        const allProjects = projectsResponse.data;
        console.log('Projetos carregados:', allProjects);
        
        // Agrupar projetos por coordenador
        const coordinatorMap = new Map<number, ProjectCoordinator>();
        
        allProjects.forEach((project: Project) => {
          if (project.coordinator) {
            const userId = project.coordinator.id;
            if (!coordinatorMap.has(userId)) {
              coordinatorMap.set(userId, {
                userId: userId,
                name: project.coordinator.name,
                email: project.coordinator.email,
                mostRecentProject: { title: project.title }
              });
            }
          }
        });
        
        const projectCoords = Array.from(coordinatorMap.values());
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
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-[#003366] to-[#004080]">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 text-white">
            Academium UFC
          </h1>
          <p className="text-xl mb-8 text-gray-200 max-w-3xl mx-auto">
            Conectando pesquisadores, projetos e conhecimento na Universidade
            Federal do Ceará. Uma plataforma para impulsionar a inovação e
            colaboração acadêmica.
          </p>
        </div>
      </section>

      {/* Seção AbacatePay */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Nosso Parceiro
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Conheça a AbacatePay, nossa parceira no desenvolvimento de
              soluções de pagamento digital.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card
              onClick={() => window.open('https://abacatepay.com', '_blank')}
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
                            {idealizador.cargo}
                          </p>
                          <p className="text-sm text-gray-500 mb-2">
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
    </div>
  );
}
