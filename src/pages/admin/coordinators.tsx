import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import api from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  type: string;
  docente?: {
    area?: string;
  };
  servidor?: {
    cargo?: string;
  };
  coordenador_institucional?: {
    id: number;
    tipo: 'pesquisa' | 'extensao';
    ativo: boolean;
  };
}

interface InstitutionalCoordinator {
  id: number;
  tipo: 'pesquisa' | 'extensao';
  ativo: boolean;
  user: {
    id: number;
    name: string;
    email: string;
    type: string;
    docente?: {
      area?: string;
    };
    servidor?: {
      cargo?: string;
    };
  };
}

export default function CoordinatorsManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentCoordinators, setCurrentCoordinators] = useState<InstitutionalCoordinator[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Carregar dados
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersResponse, coordinatorsResponse] = await Promise.all([
        api.get('/admin/coordinators/eligible'),
        api.get('/admin/coordinators/institutional')
      ]);
      
      setUsers(usersResponse.data);
      setCurrentCoordinators(coordinatorsResponse.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const assignCoordinator = async (userId: number, tipo: 'pesquisa' | 'extensao') => {
    try {
      setLoading(true);
      setError('');
      setMessage('');

      await api.post('/admin/coordinators/assign', {
        userId,
        tipo
      });

      setMessage(`Coordenador de ${tipo} atribuído com sucesso!`);
      await loadData(); // Recarregar dados
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atribuir coordenador';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const removeCoordinator = async (userId: number) => {
    try {
      setLoading(true);
      setError('');
      setMessage('');

      await api.delete(`/admin/coordinators/${userId}`);

      setMessage('Coordenador removido com sucesso!');
      await loadData(); // Recarregar dados
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao remover coordenador';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getUserInfo = (user: User) => {
    if (user.type === 'docente' && user.docente?.area) {
      return `Área: ${user.docente.area}`;
    }
    if (user.type === 'servidor' && user.servidor?.cargo) {
      return `Cargo: ${user.servidor.cargo}`;
    }
    return user.type.charAt(0).toUpperCase() + user.type.slice(1);
  };

  // Filtrar usuários baseado na busca
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    user.email.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gerenciar Coordenadores Institucionais
        </h1>
        <p className="text-gray-600">
          Atribua e gerencie coordenadores de pesquisa e extensão
        </p>
      </div>

      {message && (
        <div className="mb-6 p-4 border border-green-200 bg-green-50 rounded-md">
          <p className="text-green-800">{message}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Coordenadores Atuais */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Coordenadores Institucionais Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          {currentCoordinators.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {currentCoordinators.map((coordinator) => (
                <div
                  key={coordinator.id}
                  className="p-4 border rounded-lg bg-blue-50 border-blue-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {coordinator.user.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {coordinator.user.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        {getUserInfo(coordinator.user as User)}
                      </p>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {coordinator.tipo}
                    </Badge>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeCoordinator(coordinator.user.id)}
                    disabled={loading}
                  >
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              Nenhum coordenador institucional ativo
            </p>
          )}
        </CardContent>
      </Card>

      {/* Usuários Elegíveis */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Usuários Elegíveis para Coordenação Institucional</CardTitle>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-600" />
              <Input
                placeholder="Buscar usuários..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchFilter 
                  ? `Nenhum usuário encontrado para "${searchFilter}".`
                  : "Nenhum usuário elegível encontrado."
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-sm text-gray-600">
                        {getUserInfo(user)}
                      </p>
                      {user.coordenador_institucional && user.coordenador_institucional.ativo && (
                        <Badge variant="secondary" className="mt-2">
                          Atual: {user.coordenador_institucional.tipo}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => assignCoordinator(user.id, 'pesquisa')}
                        disabled={loading || (user.coordenador_institucional?.ativo && user.coordenador_institucional?.tipo === 'pesquisa')}
                      >
                        Pesquisa
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => assignCoordinator(user.id, 'extensao')}
                        disabled={loading || (user.coordenador_institucional?.ativo && user.coordenador_institucional?.tipo === 'extensao')}
                      >
                        Extensão
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
