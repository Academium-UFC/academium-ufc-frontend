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
        
        // Verificar se é um discente - discentes não têm perfil público
        if (profileData.type === 'discente') {
          setError("Perfis de discentes não são públicos.");
          return;
        }
        
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
      'docente': { label: 'Docente', variant: 'default' as const, icon: Award },
      'servidor': { label: 'Servidor', variant: 'secondary' as const, icon: Briefcase }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.docente;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getTipoBadge = (tipo: string) => {
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
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
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-blue-900 text-white py-4 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={brasaoBrancoHorizontal}
                alt="Brasão UFC"
                className="h-12"
              />
              <div>
                <h1 className="text-2xl font-bold">Perfil Público</h1>
                <p className="text-blue-200">Universidade Federal do Ceará</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-white hover:bg-blue-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </div>

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
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold">{profile.name}</h1>
                  {getUserTypeBadge(profile.type)}
                  {profile.coordenador_institucional && (
                    <Badge variant="outline" className="flex items-center gap-1 border-purple-300 text-purple-700">
                      <Crown className="w-3 h-3" />
                      Coordenador Institucional de {profile.coordenador_institucional.tipo === 'pesquisa' ? 'Pesquisa' : 'Extensão'}
                    </Badge>
                  )}
                </div>
                
                {profile.area_atuacao && (
                  <p className="text-lg text-gray-600 mb-4">{profile.area_atuacao}</p>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {profile.email}
                  </div>
                  {profile.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {profile.telefone}
                    </div>
                  )}
                  {profile.matricula_siape && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      SIAPE: {profile.matricula_siape}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 mt-4">
                  {profile.lattes && (
                    <a
                      href={profile.lattes}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Currículo Lattes
                    </a>
                  )}
                  {profile.linkedin && (
                    <a
                      href={profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações Detalhadas */}
          <div className="lg:col-span-2 space-y-6">
            {/* Biografia */}
            {profile.biografia && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Sobre
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{profile.biografia}</p>
                </CardContent>
              </Card>
            )}

            {/* Especialidades */}
            {profile.especialidades && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Especialidades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.especialidades.split(',').map((especialidade, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {especialidade.trim()}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Formação */}
            {profile.formacao && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Formação Acadêmica
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{profile.formacao}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Projetos */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Projetos Ativos
                  </span>
                  <Badge variant="outline">{profile.projetos.total}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.projetos.ativos.map((projeto) => (
                    <div key={projeto.id} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{projeto.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{projeto.area}</p>
                          {projeto.tipo && getTipoBadge(projeto.tipo)}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {profile.projetos.total === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      Nenhum projeto ativo no momento.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
