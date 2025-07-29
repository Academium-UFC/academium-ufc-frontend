import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ErrorAlert, SuccessAlert } from "@/components/ui/alert";
import { useAuth } from "@/lib/use-auth";
import { useNavigate } from "react-router-dom";
import { 
  formatPhone, 
  cleanPhone, 
  validateProfileData, 
  type ValidationError 
} from "@/lib/validation";
import { 
  BookOpen, 
  Calendar,
  Crown,
  Shield,
  Users,
  UserCheck,
  Edit,
  Plus,
  Trash2,
  ArrowLeft,
  Settings,
  GraduationCap,
  Monitor,
  Construction,
  AlertCircle,
  X,
  Pause
} from "lucide-react";
import brasaoBrancoHorizontal from "../../assets/img/brasao-branco-horizontal.png";
import { projectService, uploadService, authService, type Project } from "@/lib/api";

export default function ProfilePage() {
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    area: "",
    details: "",
    tipo: ""
  });
  const [profileData, setProfileData] = useState({
    biografia: user?.biografia || "",
    area_atuacao: user?.area_atuacao || "",
    especialidades: user?.especialidades || "",
    telefone: user?.telefone || "",
    curriculo_lattes: user?.lattes || "",
    linkedin: user?.linkedin || "",
    formacao: user?.formacao || "",
    tornar_publico: user?.publico || false
  });
  
  // Estados para tratamento de erros e loading
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Função para upload de avatar
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setValidationErrors([{
        field: 'avatar',
        message: 'Por favor, selecione apenas arquivos de imagem.'
      }]);
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setValidationErrors([{
        field: 'avatar',
        message: 'A imagem deve ter no máximo 5MB.'
      }]);
      return;
    }

    try {
      setIsSubmitting(true);
      setValidationErrors([]);
      
      const formData = new FormData();
      formData.append('avatar', file);
      
      // Fazer upload usando o serviço
      const result = await uploadService.uploadAvatar(formData);
      
      // Atualizar o contexto com o novo usuário
      if (result.user) {
        console.log('Avatar atualizado com sucesso:', result.user.foto_url);
        updateUser({ foto_url: result.user.foto_url });
        setSuccessMessage('Avatar atualizado com sucesso!');
        setTimeout(() => setSuccessMessage(""), 3000);
      }
      
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      setValidationErrors([{
        field: 'avatar', 
        message: 'Erro ao fazer upload da imagem. Tente novamente.'
      }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para formatar telefone durante digitação
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setProfileData({ ...profileData, telefone: formatted });
  };

  // Função para salvar perfil com validação
  const handleSaveProfile = async () => {
    // Limpar mensagens anteriores
    setValidationErrors([]);
    setSuccessMessage("");
    
    // Validar dados
    const errors = validateProfileData(profileData);
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Preparar dados para envio - limpar formatação do telefone
      const dataToSend = {
        biografia: profileData.biografia,
        area_atuacao: profileData.area_atuacao,
        especialidades: profileData.especialidades,
        formacao: profileData.formacao,
        telefone: cleanPhone(profileData.telefone),
        lattes: profileData.curriculo_lattes, // Mapear curriculo_lattes para lattes
        linkedin: profileData.linkedin,
        publico: profileData.tornar_publico
      };
      
      await authService.updateProfile(dataToSend);
      
      // Atualizar contexto do usuário - mapear lattes de volta para o contexto
      await updateUser({
        ...user,
        biografia: profileData.biografia,
        area_atuacao: profileData.area_atuacao,
        especialidades: profileData.especialidades,
        formacao: profileData.formacao,
        telefone: cleanPhone(profileData.telefone),
        lattes: profileData.curriculo_lattes, // Mapear curriculo_lattes para lattes no contexto
        linkedin: profileData.linkedin,
        publico: profileData.tornar_publico
      });
      
      setSuccessMessage('Perfil atualizado com sucesso!');
      setIsEditProfileOpen(false);
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (error: unknown) {
      console.error('Erro ao atualizar perfil:', error);
      
      // Tratar diferentes tipos de erro
      const errorObj = error as { response?: { data?: { message?: string; errors?: Record<string, string> } } };
      if (errorObj?.response?.data?.message) {
        setValidationErrors([{
          field: 'general',
          message: errorObj.response.data.message
        }]);
      } else if (errorObj?.response?.data?.errors) {
        // Se o backend retornar erros estruturados
        const backendErrors = Object.entries(errorObj.response.data.errors).map(([field, message]) => ({
          field,
          message: message as string
        }));
        setValidationErrors(backendErrors);
      } else {
        setValidationErrors([{
          field: 'general',
          message: 'Erro ao atualizar perfil. Verifique sua conexão e tente novamente.'
        }]);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para verificar se o perfil está incompleto
  const isProfileIncomplete = () => {
    if (user?.type === 'admin') return false;
    
    // Verificar se os campos obrigatórios estão preenchidos (não vazios e não nulos)
    const biografia = user?.biografia?.trim();
    const area_atuacao = user?.area_atuacao?.trim();
    const especialidades = user?.especialidades?.trim();
    const formacao = user?.formacao?.trim();
    
    const incomplete = !biografia || !area_atuacao || !especialidades || !formacao;
    
    console.log('🔍 Verificação de perfil incompleto:', {
      biografia: biografia ? `"${biografia.substring(0, 30)}..." (${biografia.length} chars)` : 'VAZIO',
      area_atuacao: area_atuacao ? `"${area_atuacao}" (${area_atuacao.length} chars)` : 'VAZIO',
      especialidades: especialidades ? `"${especialidades.substring(0, 30)}..." (${especialidades.length} chars)` : 'VAZIO',
      formacao: formacao ? `"${formacao.substring(0, 30)}..." (${formacao.length} chars)` : 'VAZIO',
      resultado: incomplete ? 'INCOMPLETO' : 'COMPLETO'
    });
    
    return incomplete;
  };

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      if (user?.type === 'docente' || user?.type === 'servidor' || user?.type === 'admin') {
        try {
          console.log('🔍 Carregando projetos para usuário:', user.name, 'ID:', user.id);
          const projects = await projectService.getMyProjects();
          console.log('📚 Projetos carregados:', projects.length, projects);
          setMyProjects(projects);
        } catch (error) {
          console.error("❌ Erro ao carregar projetos:", error);
          // Se falhar ao carregar projetos, continua com array vazio
          setMyProjects([]);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.type, user?.name, user?.id]);

  useEffect(() => {
    // Se não estiver autenticado, redireciona para login
    if (isAuthenticated === false) {
      navigate('/login');
      return;
    }
    
    // Se estiver autenticado e tiver usuário, carrega os dados
    if (isAuthenticated === true && user) {
      loadUserData();
    }
  }, [user, isAuthenticated, navigate, loadUserData]);

  // Separar useEffect para inicialização dos dados do perfil
  useEffect(() => {
    if (user) {
      // Inicializar dados do perfil sempre que o usuário mudar
      setProfileData({
        biografia: user.biografia || "",
        area_atuacao: user.area_atuacao || "",
        especialidades: user.especialidades || "",
        formacao: user.formacao || "",
        telefone: formatPhone(user.telefone || ""),
        curriculo_lattes: user.lattes || "",
        linkedin: user.linkedin || "",
        tornar_publico: user.publico || false
      });
    }
  }, [user]); // Reagir apenas quando user mudar

  const handleCreateProject = async () => {
    // Validações mais específicas
    const errors = [];
    
    if (!newProject.title.trim()) {
      errors.push("• Título do projeto é obrigatório");
    } else if (newProject.title.trim().length < 10) {
      errors.push("• Título deve ter pelo menos 10 caracteres");
    }
    
    if (!newProject.area.trim()) {
      errors.push("• Área de pesquisa é obrigatória");
    }
    
    if (!newProject.details.trim()) {
      errors.push("• Descrição do projeto é obrigatória");
    } else if (newProject.details.trim().length < 50) {
      errors.push("• Descrição deve ter pelo menos 50 caracteres");
    }
    
    if (!newProject.tipo.trim()) {
      errors.push("• Tipo do projeto é obrigatório");
    }
    
    if (errors.length > 0) {
      alert(`Por favor, corrija os seguintes erros:\n\n${errors.join('\n')}`);
      return;
    }

    try {
      await projectService.create({
        title: newProject.title.trim(),
        area: newProject.area.trim(),
        details: newProject.details.trim(),
        tipo: newProject.tipo as 'pesquisa' | 'extensao' | 'misto'
      });
      await loadUserData();
      setNewProject({ title: "", area: "", details: "", tipo: "" });
      setIsCreateDialogOpen(false);
      alert("Projeto criado com sucesso e enviado para aprovação!");
    } catch (error) {
      console.error("Erro ao criar projeto:", error);
      alert("Erro ao criar projeto. Verifique os dados e tente novamente.");
    }
  };

    const handleDeleteProject = async (projectId: number) => {
    if (!confirm("Tem certeza que deseja excluir este projeto?")) {
      return;
    }

    try {
      await projectService.delete(projectId);
      setMyProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
    } catch (error) {
      console.error("Erro ao excluir projeto:", error);
      alert("Erro ao excluir projeto. Tente novamente.");
    }
  };

  // Função para verificar se o usuário pode editar/excluir o projeto
  const canManageProject = (project: Project) => {
    if (!user) return false;
    if (user.type === 'admin') return true;
    
    // Verificar se é coordenador
    if (project.coordinator?.user?.id === user.id) return true;
    
    // Verificar se é sub-coordenador
    if (project.subCoordinator?.user?.id === user.id) return true;
    
    return false;
  };

  const getUserTypeBadge = (type: string) => {
    const typeConfig = {
      'admin': { label: 'Administrador', variant: 'destructive' as const, icon: Crown },
      'docente': { label: 'Docente', variant: 'default' as const, icon: UserCheck },
      'servidor': { label: 'Servidor', variant: 'secondary' as const, icon: Shield },
      'discente': { label: 'Discente', variant: 'outline' as const, icon: Users }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.discente;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { label: 'Pendente', variant: 'secondary' as const },
      'approved': { label: 'Aprovado', variant: 'default' as const },
      'rejected': { label: 'Rejeitado', variant: 'destructive' as const },
      'inactivated': { label: 'Inativo', variant: 'outline' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Mostrar loading enquanto verifica autenticação
  if (isAuthenticated === null || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado ou não tiver usuário, não renderiza nada
  // (o useEffect já deve ter redirecionado)
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img
                src={brasaoBrancoHorizontal}
                className="h-20 w-40 object-contain cursor-pointer"
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
                {user?.type === 'admin' && (
                  <a
                    onClick={() => navigate("/admin")}
                    className="text-sm hover:text-blue-200 transition-colors cursor-pointer"
                  >
                    Admin
                  </a>
                )}
              </nav>
            </div>
            <nav className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={logout} 
                className="text-white hover:text-blue-200 hover:bg-blue-800/30 transition-colors"
              >
                Sair
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Alertas globais */}
        {successMessage && (
          <div className="mb-6">
            <SuccessAlert 
              message={successMessage} 
              onClose={() => setSuccessMessage("")}
            />
          </div>
        )}
        
        {validationErrors.length > 0 && !isEditProfileOpen && (
          <div className="mb-6">
            <ErrorAlert 
              errors={validationErrors} 
              onClose={() => setValidationErrors([])}
            />
          </div>
        )}
        
        {/* Informações do Usuário */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {user?.foto_url ? (
                    <img 
                      src={user.foto_url} 
                      alt={`Foto de ${user.name}`}
                      className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md border cursor-pointer hover:bg-gray-50">
                    <Edit className="h-3 w-3 text-gray-600" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleAvatarUpload}
                    />
                  </label>
                </div>
                <div>
                  <CardTitle className="text-2xl">{user?.name}</CardTitle>
                  <p className="text-gray-600">{user?.email}</p>
                  <div className="mt-2">
                    {user && getUserTypeBadge(user.type)}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {/* Indicador de perfil incompleto */}
                {isProfileIncomplete() && (
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Perfil incompleto - Complete para aparecer nos perfis públicos</span>
                  </div>
                )}
                
                <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 transition-colors"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Editar Perfil
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Editar Perfil</DialogTitle>
                    </DialogHeader>
                    
                    {/* Alertas de erro e sucesso */}
                    {validationErrors.length > 0 && (
                      <ErrorAlert 
                        errors={validationErrors} 
                        onClose={() => setValidationErrors([])}
                      />
                    )}
                    
                    {successMessage && (
                      <SuccessAlert 
                        message={successMessage} 
                        onClose={() => setSuccessMessage("")}
                      />
                    )}
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="biografia">Biografia</Label>
                        <Textarea
                          id="biografia"
                          placeholder="Conte um pouco sobre você..."
                          value={profileData.biografia}
                          onChange={(e) => setProfileData({ ...profileData, biografia: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="area_atuacao">Área de Atuação</Label>
                        <Input
                          id="area_atuacao"
                          placeholder="Sua área de atuação..."
                          value={profileData.area_atuacao}
                          onChange={(e) => setProfileData({ ...profileData, area_atuacao: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="especialidades">Área de Interesse</Label>
                        <Input
                          id="especialidades"
                          placeholder="Suas áreas de interesse (separadas por vírgula)..."
                          value={profileData.especialidades}
                          onChange={(e) => setProfileData({ ...profileData, especialidades: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="formacao">Formação</Label>
                        <Input
                          id="formacao"
                          placeholder="Sua formação acadêmica..."
                          value={profileData.formacao}
                          onChange={(e) => setProfileData({ ...profileData, formacao: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input
                          id="telefone"
                          placeholder="(85) 99999-9999"
                          value={profileData.telefone}
                          onChange={handlePhoneChange}
                          maxLength={15}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="lattes">Currículo Lattes</Label>
                        <Input
                          id="lattes"
                          placeholder="Link do seu Currículo Lattes..."
                          value={profileData.curriculo_lattes}
                          onChange={(e) => setProfileData({ ...profileData, curriculo_lattes: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          placeholder="Link do seu LinkedIn..."
                          value={profileData.linkedin}
                          onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="publico"
                          checked={profileData.tornar_publico}
                          onChange={(e) => setProfileData({ ...profileData, tornar_publico: e.target.checked })}
                          className="rounded"
                        />
                        <Label htmlFor="publico">Tornar perfil público</Label>
                      </div>
                      
                      <div className="flex justify-end gap-2 mt-6">
                        <Button 
                          variant="outline" 
                          className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsEditProfileOpen(false)}
                          disabled={isSubmitting}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          onClick={handleSaveProfile}
                          disabled={isSubmitting}
                          className="bg-blue-600 hover:bg-blue-700 text-white transition-colors px-6 py-2"
                        >
                          {isSubmitting ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Salvando...</span>
                            </div>
                          ) : (
                            'Salvar Perfil'
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Projetos do Usuário */}
        {(user?.type === 'docente' || user?.type === 'servidor' || user?.type === 'admin') && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Meus Projetos ({myProjects.length})
                </CardTitle>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Projeto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Criar Novo Projeto</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Título do Projeto</Label>
                        <Input
                          id="title"
                          placeholder="Digite o título do projeto..."
                          value={newProject.title}
                          onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="area">Área de Pesquisa</Label>
                        <Input
                          id="area"
                          placeholder="Digite a área de pesquisa..."
                          value={newProject.area}
                          onChange={(e) => setNewProject({ ...newProject, area: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="details">Descrição do Projeto</Label>
                        <Textarea
                          id="details"
                          placeholder="Descreva detalhadamente o projeto..."
                          value={newProject.details}
                          onChange={(e) => setNewProject({ ...newProject, details: e.target.value })}
                          rows={4}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="tipo">Tipo do Projeto</Label>
                        <select
                          id="tipo"
                          value={newProject.tipo}
                          onChange={(e) => setNewProject({ ...newProject, tipo: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Selecione o tipo do projeto</option>
                          <option value="pesquisa">Pesquisa</option>
                          <option value="extensao">Extensão</option>
                          <option value="misto">Pesquisa e Extensão</option>
                        </select>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleCreateProject} 
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                        >
                          Criar Projeto
                        </Button>
                        <Button 
                          variant="outline" 
                          className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => {
                            setIsCreateDialogOpen(false);
                            setNewProject({ title: "", area: "", details: "", tipo: "" });
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Carregando projetos...</p>
                </div>
              ) : myProjects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Você ainda não possui projetos cadastrados.</p>
                  <p className="text-sm">Clique em "Novo Projeto" para começar.</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Debug: Usuário {user?.name} (ID: {user?.id}, Tipo: {user?.type})
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {myProjects.map((project) => (
                    <Card key={project.id} className={`border-l-4 ${
                      project.status === 'approved' ? 'border-l-green-500' :
                      project.status === 'rejected' ? 'border-l-red-500' :
                      project.status === 'inactivated' ? 'border-l-gray-500' :
                      'border-l-blue-500'
                    }`}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{project.title}</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">Área: {project.area}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Tipo: {project.tipo === 'pesquisa' ? 'Pesquisa' : 
                                     project.tipo === 'extensao' ? 'Extensão' : 
                                     project.tipo === 'misto' ? 'Pesquisa e Extensão' : 'Não especificado'}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <Calendar className="h-3 w-3" />
                              Criado em: {new Date(project.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                            
                            {/* Informações de aprovação/rejeição */}
                            {project.status === 'approved' && project.approver && (
                              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                                <p className="text-sm text-green-800 font-medium">✓ Projeto Aprovado</p>
                                <p className="text-xs text-green-600">
                                  Por: {project.approver.name} • {new Date(project.approved_at!).toLocaleDateString('pt-BR')}
                                </p>
                                {project.admin_notes && (
                                  <p className="text-xs text-green-600 mt-1">"{project.admin_notes}"</p>
                                )}
                              </div>
                            )}
                            
                            {project.status === 'rejected' && (
                              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                <p className="text-sm text-red-800 font-medium flex items-center gap-1">
                                  <X className="h-4 w-4" /> Projeto Rejeitado
                                </p>
                                {project.reviewer && (
                                  <p className="text-xs text-red-600">
                                    Por: {project.reviewer.name} • {new Date(project.reviewed_at!).toLocaleDateString('pt-BR')}
                                  </p>
                                )}
                                {project.rejection_reason && (
                                  <div className="mt-1">
                                    <p className="text-xs font-medium text-red-700">Motivo:</p>
                                    <p className="text-xs text-red-600 bg-red-100 p-1 rounded mt-1">
                                      "{project.rejection_reason}"
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {project.status === 'inactivated' && project.reviewer && (
                              <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded">
                                <p className="text-sm text-gray-800 font-medium flex items-center gap-1">
                                  <Pause className="h-4 w-4" /> Projeto Inativo
                                </p>
                                <p className="text-xs text-gray-600">
                                  Por: {project.reviewer.name} • {new Date(project.reviewed_at!).toLocaleDateString('pt-BR')}
                                </p>
                                {project.admin_notes && (
                                  <p className="text-xs text-gray-600 mt-1">"{project.admin_notes}"</p>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(project.status || 'pending')}
                            {canManageProject(project) && (
                              <>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleDeleteProject(project.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Descrição:</span>
                          </p>
                          <div className="bg-gray-50 p-3 rounded border">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                              {project.details}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Seções específicas para Discentes */}
        {user?.type === 'discente' && (
          <div className="space-y-8">
            {/* Seção de Monitorias */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Minhas Monitorias (0)
                  </CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Monitoria
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Construction className="h-5 w-5 text-orange-500" />
                          Funcionalidade em Desenvolvimento
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 py-4">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-8 w-8 text-orange-500" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2 text-gray-800">
                            Sistema de Monitorias em Breve!
                          </h3>
                          <p className="text-gray-600 mb-4 leading-relaxed">
                            Estamos trabalhando para implementar o sistema de criação e gestão de monitorias.
                            Em breve você poderá criar e gerenciar suas atividades de monitoria diretamente na plataforma.
                          </p>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <h4 className="font-medium text-blue-800 mb-2">O que você poderá fazer:</h4>
                            <ul className="text-sm text-blue-700 space-y-1 text-left">
                              <li>• Criar propostas de monitoria para disciplinas</li>
                              <li>• Gerenciar cronogramas e atividades</li>
                              <li>• Acompanhar estudantes participantes</li>
                              <li>• Gerar relatórios de atividades</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma monitoria cadastrada</p>
                  <p className="text-sm">Clique em "Nova Monitoria" para começar.</p>
                </div>
              </CardContent>
            </Card>

            {/* Seção de Minicursos */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Meus Minicursos (0)
                  </CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Minicurso
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Construction className="h-5 w-5 text-orange-500" />
                          Funcionalidade em Desenvolvimento
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 py-4">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-8 w-8 text-orange-500" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2 text-gray-800">
                            Sistema de Minicursos em Breve!
                          </h3>
                          <p className="text-gray-600 mb-4 leading-relaxed">
                            Estamos desenvolvendo o sistema de criação e gestão de minicursos.
                            Em breve você poderá propor e conduzir minicursos para a comunidade acadêmica.
                          </p>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                            <h4 className="font-medium text-green-800 mb-2">O que você poderá fazer:</h4>
                            <ul className="text-sm text-green-700 space-y-1 text-left">
                              <li>• Criar propostas de minicursos</li>
                              <li>• Definir cronogramas e conteúdo programático</li>
                              <li>• Gerenciar inscrições de participantes</li>
                              <li>• Emitir certificados de participação</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum minicurso cadastrado</p>
                  <p className="text-sm">Clique em "Novo Minicurso" para começar.</p>
                </div>
              </CardContent>
            </Card>

            {/* Projetos que Participa */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Projetos que Participo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Você não está participando de nenhum projeto no momento.</p>
                  <p className="text-sm">Entre em contato com docentes para participar de projetos.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}