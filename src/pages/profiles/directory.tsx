import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { LoadingCard } from "@/components/ui/loading";
import { 
  Users, 
  Crown,
  Award,
  Briefcase,
  ArrowLeft,
  Search,
  Menu
} from "lucide-react";
import brasaoBrancoHorizontal from "../../assets/img/brasao-branco-horizontal.png";
import { profileService, type PublicProfileSummary } from "@/lib/api";
import { useAuth } from "@/lib/use-auth";
import { UserMenu } from "@/components/ui/user-menu";

export default function ProfilesDirectoryPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [profiles, setProfiles] = useState<PublicProfileSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<'docente' | 'servidor' | ''>('');
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        setLoading(true);
        const filters: {
          search?: string;
          type?: 'docente' | 'servidor';
        } = {};
        if (searchTerm) filters.search = searchTerm;
        if (typeFilter) filters.type = typeFilter;
        
        const data = await profileService.getAll(filters);
        setProfiles(data.profiles);
        
        // Reset para página 1 quando filtros mudam
        setCurrentPage(1);
      } catch (error) {
        console.error("Erro ao carregar perfis:", error);
        setError("Erro ao carregar perfis públicos.");
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, [searchTerm, typeFilter]);

  // Cálculos de paginação
  const totalPages = Math.ceil(profiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProfiles = profiles.slice(startIndex, endIndex);

  const getUserTypeBadge = (type: string) => {
    const typeConfig = {
      'admin': { label: 'Administrador', color: 'bg-red-100 text-red-800', icon: Crown },
      'docente': { label: 'Docente', color: 'bg-blue-100 text-blue-800', icon: Award },
      'servidor': { label: 'Servidor', color: 'bg-green-100 text-green-800', icon: Briefcase },
      'discente': { label: 'Discente', color: 'bg-purple-100 text-purple-800', icon: Users }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.docente;
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
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
                    className="text-sm text-blue-200 transition-colors cursor-pointer flex items-center gap-1"
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
                {!isAuthenticated ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate("/login")}
                      className="text-white hover:text-blue-200"
                    >
                      Entrar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/cadastro")}
                      className="text-white border-white hover:bg-white hover:text-blue-900"
                    >
                      Cadastrar
                    </Button>
                  </>
                ) : (
                  <UserMenu />
                )}
                <Button variant="ghost" size="sm" className="md:hidden text-white">
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 min-h-[calc(100vh-4rem)]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando perfis...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
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
                  className="text-sm text-blue-200 transition-colors cursor-pointer flex items-center gap-1"
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
              {!isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/login")}
                    className="text-white hover:text-blue-200"
                  >
                    Entrar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/cadastro")}
                    className="text-white border-white hover:bg-white hover:text-blue-900"
                  >
                    Cadastrar
                  </Button>
                </>
              ) : (
                <UserMenu />
              )}
              <Button variant="ghost" size="sm" className="md:hidden text-white">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-[calc(100vh-4rem)]">
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Diretório de Perfis</h1>
            <p className="text-gray-600">Docentes e Servidores da UFC</p>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar por nome
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Digite o nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por tipo
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as 'docente' | 'servidor' | '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos os tipos</option>
                  <option value="docente">Docentes</option>
                  <option value="servidor">Servidores</option>
                </select>
              </div>
              {(searchTerm || typeFilter) && (
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setTypeFilter("");
                    }}
                    className="w-full"
                  >
                    Limpar Filtros
                  </Button>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(12).fill(0).map((_, index) => (
                <LoadingCard key={index} />
              ))}
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm || typeFilter ? "Nenhum perfil encontrado" : "Nenhum perfil público disponível"}
              </h3>
              <p className="text-gray-600">
                {searchTerm || typeFilter 
                  ? "Tente ajustar os filtros de busca" 
                  : "Não há perfis públicos cadastrados no momento"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProfiles.map((profile) => (
                  <Card 
                    key={profile.id} 
                    className="bg-white hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 group relative overflow-hidden"
                    onClick={() => navigate(`/perfil-publico/${profile.id}`)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow duration-300">
                          <span className="text-white text-lg font-bold">
                            {profile.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-gray-900 mb-2 truncate group-hover:text-blue-700 transition-colors duration-300">
                            {profile.name}
                          </h3>
                          <div className="mb-3">
                            {getUserTypeBadge(profile.type)}
                          </div>
                          {profile.area_atuacao && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {profile.area_atuacao}
                            </p>
                          )}
                          {profile.especialidades && (
                            <p className="text-xs text-gray-500 line-clamp-1">
                              {profile.especialidades}
                            </p>
                          )}
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
    </div>
  );
}
