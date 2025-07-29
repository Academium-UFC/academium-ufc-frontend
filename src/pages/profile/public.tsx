import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  ExternalLink, 
  BookOpen,
  Award,
  Briefcase,
  Users,
  Crown
} from "lucide-react";
import brasaoBrancoHorizontal from "../../assets/img/brasao-branco-horizontal.png";
import { profileService, type PublicProfile } from "@/lib/api";

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!id) {
          navigate('/');
          return;
        }

        setLoading(true);
        const profileData = await profileService.getById(Number(id));
        setProfile(profileData);
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        setError("Erro ao carregar perfil. Verifique se o perfil existe e é público.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id, navigate]);

  const getUserTypeBadge = (type: string) => {
    const typeConfig = {
      'admin': { label: 'Administrador', color: 'bg-red-100 text-red-800' },
      'docente': { label: 'Docente', color: 'bg-blue-100 text-blue-800' },
      'servidor': { label: 'Servidor', color: 'bg-green-100 text-green-800' },
      'discente': { label: 'Discente', color: 'bg-purple-100 text-purple-800' }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.docente;
    
    return (
      <Badge className={`${config.color} text-sm`}>
        {config.label}
      </Badge>
    );
  };

  const getProjectTypeBadge = (tipo: string) => {
    const tipoConfig = {
      'pesquisa': { label: 'Pesquisa', color: 'bg-blue-100 text-blue-800' },
      'extensao': { label: 'Extensão', color: 'bg-green-100 text-green-800' },
      'misto': { label: 'Misto', color: 'bg-purple-100 text-purple-800' }
    };
    
    const config = tipoConfig[tipo as keyof typeof tipoConfig] || tipoConfig.pesquisa;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
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
                    className="text-sm hover:text-blue-200 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Users className="w-4 h-4" />
                    Perfis
                  </a>
                </nav>
              </div>
            </div>
          </div>
        </header>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 min-h-[calc(100vh-4rem)]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando perfil...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
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
                    className="text-sm hover:text-blue-200 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Users className="w-4 h-4" />
                    Perfis
                  </a>
                </nav>
              </div>
            </div>
          </div>
        </header>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 min-h-[calc(100vh-4rem)]">
          <div className="max-w-6xl mx-auto">
            <Card className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Perfil não encontrado</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao início
              </Button>
            </Card>
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
                  className="text-sm hover:text-blue-200 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Users className="w-4 h-4" />
                  Perfis
                </a>
              </nav>
            </div>
          </div>
        </div>
      </header>
      
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-[calc(100vh-4rem)]">
        <div className="max-w-6xl mx-auto p-6">
          {/* Cabeçalho do Perfil */}
          <Card className="mb-6">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">
                      {profile.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <h1 className="text-3xl font-bold">{profile.name}</h1>
                    {getUserTypeBadge(profile.type)}
                    {profile.coordenador_institucional && (
                      <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        Coordenador Institucional de {profile.coordenador_institucional.tipo === 'pesquisa' ? 'Pesquisa' : 'Extensão'}
                      </Badge>
                    )}
                  </div>
                  {profile.area_atuacao && (
                    <p className="text-lg text-gray-600 mb-4">{profile.area_atuacao}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      {profile.email}
                    </div>
                    {profile.telefone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        {profile.telefone}
                      </div>
                    )}
                    {profile.matricula_siape && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Briefcase className="w-4 h-4" />
                        SIAPE: {profile.matricula_siape}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3 mt-4">
                    {profile.lattes && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(profile.lattes, '_blank')}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Lattes
                      </Button>
                    )}
                    {profile.linkedin && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(profile.linkedin, '_blank')}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        LinkedIn
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informações Acadêmicas */}
            <div className="lg:col-span-2 space-y-6">
              {profile.biografia && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Biografia
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{profile.biografia}</p>
                  </CardContent>
                </Card>
              )}

              {profile.projetos && profile.projetos.total > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Projetos ({profile.projetos.total})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[...profile.projetos.coordenador, ...profile.projetos.sub_coordenador, ...profile.projetos.colaborador].map((project) => (
                        <div 
                          key={project.id} 
                          className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => navigate(`/projetos/${project.id}`)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.details}</p>
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className="text-xs">{project.area}</Badge>
                                {getProjectTypeBadge(project.tipo || 'pesquisa')}
                                <span className="text-xs text-gray-500">
                                  ID: {project.id}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Informações Complementares */}
            <div className="space-y-6">
              {(profile.especialidades || profile.formacao) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Qualificações
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile.especialidades && (
                      <div>
                        <h4 className="font-medium mb-2">Área de Interesse</h4>
                        <p className="text-sm text-gray-600">{profile.especialidades}</p>
                      </div>
                    )}
                    {profile.formacao && (
                      <div>
                        <h4 className="font-medium mb-2">Formação</h4>
                        <p className="text-sm text-gray-600">{profile.formacao}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
