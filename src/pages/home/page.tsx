import { useState, useEffect } from "react";
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
import { useAuth } from "@/lib/use-auth";
import { projectService } from "@/lib/api";
import type { Project } from "@/lib/api";

export default function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await projectService.getAll();
      setProjects(projectsData);
    } catch (error: unknown) {
      setError("Erro ao carregar projetos");
      console.error("Erro ao carregar projetos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-[#003366] text-white py-4 shadow-lg">
        <div className="flex items-center justify-between w-full px-4 lg:px-8">
          <div className="flex items-center gap-6">
            <img
              src={brasaoBrancoHorizontal}
              className="h-14 w-28 object-contain"
              alt="Logo UFC"
            />
            <nav className="hidden md:flex items-center gap-6">
              <a
                href="#"
                className="hover:text-blue-200 transition-colors font-medium"
              >
                Início
              </a>
              <a
                href="#"
                className="hover:text-blue-200 transition-colors font-medium"
              >
                Eventos
              </a>
              <a
                href="#"
                className="hover:text-blue-200 transition-colors font-medium"
              >
                Projetos
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Encontre o que você procura"
                className="pl-10 pr-4 py-2 rounded-lg text-black text-sm placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-blue-300 shadow-sm w-64"
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
                  <DialogTitle>
                    {isAuthenticated ? `Bem-vindo(a), ${user?.name}` : "Bem-vindo(a)"}
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 mt-4">
                  {isAuthenticated ? (
                    <>
                      <div className="text-sm text-gray-600">
                        <p><strong>Email:</strong> {user?.email}</p>
                        <p><strong>Tipo:</strong> {user?.type}</p>
                      </div>
                      <Button
                        onClick={() => navigate("/meus-projetos")}
                        className="bg-[#003366] text-white hover:bg-[#002244]"
                      >
                        Meus Projetos
                      </Button>
                      <Button
                        onClick={() => navigate("/criar-projeto")}
                        className="bg-[#003366] text-white hover:bg-[#002244]"
                      >
                        Criar Projeto
                      </Button>
                      <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Sair
                      </Button>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <section className="bg-[#004080] text-white px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Vitrine Tecnológica UFC - Itapajé
          </h1>
          <p className="text-xl mb-8 text-blue-100">
            Descubra os projetos inovadores da nossa comunidade acadêmica
          </p>
          <Button 
            onClick={() => document.getElementById('projetos')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white text-[#004080] hover:bg-gray-100 font-semibold px-10 py-3 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            Ver Projetos
          </Button>
        </div>
      </section>

      <section id="projetos" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Projetos Recentes
            </h2>
            <p className="text-lg text-gray-600">
              Conheça os projetos desenvolvidos pela nossa comunidade
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366]"></div>
              <p className="mt-4 text-gray-600">Carregando projetos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
              <Button 
                onClick={loadProjects}
                className="mt-4 bg-[#003366] text-white hover:bg-[#002244]"
              >
                Tentar Novamente
              </Button>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Nenhum projeto encontrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.slice(0, 6).map((project) => (
                <Card
                  key={project.id}
                  className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md"
                >
                  <CardContent className="p-6">
                    <div className="w-full h-48 bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
                      <div className="w-16 h-16 bg-[#003366] rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">
                          {project.id}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-gray-800">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      <strong>Área:</strong> {project.area}
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      {project.details.length > 150 
                        ? `${project.details.substring(0, 150)}...` 
                        : project.details
                      }
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Nossa Comunidade
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col items-center md:items-start">
              <div className="w-40 h-40 bg-[#003366] rounded-full mb-6 flex items-center justify-center shadow-lg">
                <span className="text-white text-3xl font-bold">UFC</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">
                Universidade Federal do Ceará
              </h3>
              <p className="text-[#003366] mb-2 font-medium">
                Campus: Itapajé
              </p>
              <p className="text-gray-600">Promovendo inovação e conhecimento</p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <Carousel>
                <CarouselContent>
                  {['Docentes', 'Servidores', 'Discentes', 'Administradores'].map((tipo, i) => (
                    <CarouselItem key={i} className="p-4">
                      <div className="text-center">
                        <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center shadow-sm">
                          <span className="text-[#003366] font-bold text-lg">
                            {i + 1}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-700">
                          {tipo}
                        </p>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="bg-white shadow-md hover:bg-gray-50" />
                <CarouselNext className="bg-white shadow-md hover:bg-gray-50" />
              </Carousel>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Nosso Campus
            </h2>
            <p className="text-lg text-gray-600">
              Conheça mais sobre nossa estrutura
            </p>
          </div>
          <div className="relative aspect-video bg-gray-200 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#003366] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">🏛️</span>
              </div>
              <p className="text-gray-600">Imagem do campus em breve</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#003366] text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Vitrine Tecnológica</h3>
              <p className="text-blue-100">
                Promovendo a inovação e o conhecimento na UFC - Campus Itapajé.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contato</h3>
              <p className="text-blue-100">Email: vitrine@ufc.br</p>
              <p className="text-blue-100">Telefone: (85) 1234-5678</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Links Úteis</h3>
              <ul className="space-y-2 text-blue-100">
                <li><a href="#" className="hover:text-white">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-white">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-white">Termos de Uso</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-500 mt-8 pt-8 text-center text-blue-100">
            <p>&copy; 2024 Vitrine Tecnológica UFC - Itapajé. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}