import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Users, 
  Crown,
  Award,
  Briefcase
} from "lucide-react";
import brasaoBrancoHorizontal from "../../assets/img/brasao-branco-horizontal.png";
import { profileService, type PublicProfileSummary } from "@/lib/api";

export default function ProfilesDirectoryPage() {
  const navigate = useNavigate();
  
  const [profiles, setProfiles] = useState<PublicProfileSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<'docente' | 'servidor' | ''>('');

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        setLoading(true);
        const filters: any = {};
        if (searchTerm) filters.search = searchTerm;
        if (typeFilter) filters.type = typeFilter;
        
        const data = await profileService.getAll(filters);
        setProfiles(data.profiles);
      } catch (error) {
        console.error("Erro ao carregar perfis:", error);
        setError("Erro ao carregar perfis públicos.");
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, [searchTerm, typeFilter]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando perfis...</p>
          </div>
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
                <h1 className="text-2xl font-bold">Diretório de Perfis</h1>
                <p className="text-blue-200">Docentes e Servidores da UFC</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-white hover:bg-blue-800"
            >
              Início
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por nome, especialidades ou área..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={typeFilter === '' ? 'default' : 'outline'}
                  onClick={() => setTypeFilter('')}
                >
                  Todos
                </Button>
                <Button
                  variant={typeFilter === 'docente' ? 'default' : 'outline'}
                  onClick={() => setTypeFilter('docente')}
                >
                  <Award className="w-4 h-4 mr-2" />
                  Docentes
                </Button>
                <Button
                  variant={typeFilter === 'servidor' ? 'default' : 'outline'}
                  onClick={() => setTypeFilter('servidor')}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Servidores
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Perfis */}
        {error ? (
          <Card className="p-8 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">Erro</h2>
            <p className="text-gray-600">{error}</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile) => (
              <Card 
                key={profile.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/perfil-publico/${profile.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg font-bold">
                        {profile.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 truncate">{profile.name}</h3>
                        {getUserTypeBadge(profile.type)}
                      </div>
                      
                      {profile.coordenador_institucional && (
                        <Badge variant="outline" className="mb-2 text-xs border-purple-300 text-purple-700">
                          <Crown className="w-3 h-3 mr-1" />
                          Coord. {profile.coordenador_institucional.tipo === 'pesquisa' ? 'Pesquisa' : 'Extensão'}
                        </Badge>
                      )}
                      
                      {profile.area_atuacao && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{profile.area_atuacao}</p>
                      )}
                      
                      {profile.especialidades && (
                        <div className="flex flex-wrap gap-1">
                          {profile.especialidades.split(',').slice(0, 2).map((esp, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {esp.trim()}
                            </Badge>
                          ))}
                          {profile.especialidades.split(',').length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{profile.especialidades.split(',').length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {profiles.length === 0 && !loading && !error && (
          <Card className="p-8 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-600 mb-2">Nenhum perfil encontrado</h2>
            <p className="text-gray-500">
              {searchTerm || typeFilter 
                ? "Tente ajustar os filtros de busca."
                : "Não há perfis públicos disponíveis no momento."
              }
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
