import axios, { type AxiosResponse, type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL + '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Extrair mensagem de erro específica do backend
    let errorMessage = 'Erro desconhecido';
    
    if (error.response?.data) {
      const data = error.response.data as { 
        error?: string; 
        message?: string; 
        errors?: Array<{ msg?: string; message?: string }> 
      };
      
      if (data.error) {
        errorMessage = data.error;
      } else if (data.message) {
        errorMessage = data.message;
      } else if (data.errors && Array.isArray(data.errors)) {
        // Para erros de validação que vêm como array
        errorMessage = data.errors.map((err) => err.msg || err.message).join(', ');
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Criar um novo erro com a mensagem extraída
    const customError = new Error(errorMessage);
    return Promise.reject(customError);
  }
);

export type User = {
  id: number;
  name: string;
  email: string;
  type: 'admin' | 'docente' | 'discente' | 'servidor';
  matricula?: string;
  education?: string;
  course?: string;
  area?: string;
  biografia?: string;
  especialidades?: string;
  formacao?: string;
  area_atuacao?: string;
  telefone?: string;
  lattes?: string;
  linkedin?: string;
  publico?: boolean;
  foto_url?: string;
  matricula_siape?: string;
  coordenador_institucional?: {
    tipo: 'pesquisa' | 'extensao';
    ativo: boolean;
  };
};

export type Collaborator = {
  id: number;
  user: User;
  type: string;
  projectId: number;
};

export type InstitutionalCoordinator = {
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
};

export type Project = {
  id: number;
  title: string;
  area: string;
  details: string;
  tipo?: 'pesquisa' | 'extensao' | 'misto';
  imageUrl?: string; // URL da imagem/banner do projeto
  status?: 'pending' | 'approved' | 'rejected' | 'inactivated';
  
  // Campos de aprovação/rejeição
  rejection_reason?: string;
  admin_notes?: string;
  approved_by?: number;
  approved_at?: string;
  reviewed_by?: number;
  reviewed_at?: string;
  
  // Informações de quem aprovou/revisou
  reviewer?: {
    id: number;
    name: string;
    email: string;
  };
  approver?: {
    id: number;
    name: string;
    email: string;
  };
  
  createdAt: string;
  updatedAt: string;
  coordinator?: {
    id: number;
    matricula_siape: string;
    userId: number;
    user: {
      id: number;
      name: string;
      email: string;
      type: 'admin' | 'docente' | 'discente' | 'servidor';
      foto_url?: string;
    };
  };
  subCoordinator?: {
    id: number;
    matricula_siape: string;
    userId: number;
    user: {
      id: number;
      name: string;
      email: string;
      type: 'admin' | 'docente' | 'discente' | 'servidor';
      foto_url?: string;
    };
  };
  coordenadorInstitucional?: {
    tipo: 'pesquisa' | 'extensao';
    coordenador: {
      user: {
        name: string;
        email: string;
      };
    };
    coordenadorExtensao?: {
      user: {
        name: string;
        email: string;
      };
    };
  };
  collaborators?: Array<{
    id: number;
    user: User;
    type: string;
  }>;
};

export type AdminStats = {
  users: {
    total: number;
    docentes: number;
    discentes: number;
    servidores: number;
    admins: number;
  };
  projects: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    inactive: number;
  };
};

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

export type RegisterData = {
  name: string;
  email: string;
  password: string;
  type: 'docente' | 'discente' | 'servidor';
  education?: string;
  course?: string;
  area?: string;
};

export interface LoginData {
  email: string;
  password: string;
}

export interface CreateProjectData {
  title: string;
  area: string;
  details: string;
  tipo?: 'pesquisa' | 'extensao' | 'misto';
}

export const authService = {
  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  login: async (data: LoginData): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  me: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  updateProfile: async (data: {
    biografia?: string;
    area_atuacao?: string;
    especialidades?: string;
    formacao?: string;
    telefone?: string;
    lattes?: string;
    linkedin?: string;
    publico?: boolean;
  }): Promise<{ user: User; message: string }> => {
    const response = await api.put('/auth/me', data);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export const projectService = {
  getAll: async (filters?: {
    area?: string;
    status?: string;
    coordenadorType?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<Project[]> => {
    const params = new URLSearchParams();
    if (filters?.area) params.append('area', filters.area);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.coordenadorType) params.append('coordenadorType', filters.coordenadorType);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const queryString = params.toString();
    const url = queryString ? `/projects?${queryString}` : '/projects';
    
    const response = await api.get(url);
    return response.data.projetos || response.data.projects || response.data;
  },

  // Método específico para projetos aprovados (aba Projetos)
  getApproved: async (filters?: {
    area?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<Project[]> => {
    const params = new URLSearchParams();
    if (filters?.area) params.append('area', filters.area);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const queryString = params.toString();
    const url = queryString ? `/projects/approved?${queryString}` : '/projects/approved';
    
    const response = await api.get(url);
    return response.data.projetos || response.data.projects || response.data;
  },

  // Método específico para rota pública (sem filtro de status)
  getPublic: async (filters?: {
    area?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<Project[]> => {
    const params = new URLSearchParams();
    if (filters?.area) params.append('area', filters.area);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const queryString = params.toString();
    const url = queryString ? `/projects/public?${queryString}` : '/projects/public';
    
    const response = await api.get(url);
    return response.data.projetos || response.data.projects || response.data;
  },

  // Método para painel administrativo (com filtros de status)
  getAllAdmin: async (filters?: {
    area?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<Project[]> => {
    const params = new URLSearchParams();
    if (filters?.area) params.append('area', filters.area);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const queryString = params.toString();
    const url = queryString ? `/projects/admin/all?${queryString}` : '/projects/admin/all';
    
    const response = await api.get(url);
    return response.data.projetos || response.data.projects || response.data;
  },
  getById: async (id: number): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    const project = response.data;
    
    // Mapear coordenador para coordinator para compatibilidade com o tipo
    if (project.coordenador) {
      project.coordinator = project.coordenador;
    }
    if (project.subCoordenador) {
      project.subCoordinator = project.subCoordenador;
    }
    
    return project;
  },
  getMyProjects: async (): Promise<Project[]> => {
    const response = await api.get('/projects/mine');
    const projects = response.data;
    // Mapear coordenador para coordinator para cada projeto
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return projects.map((project: any) => {
      if (project.coordenador) {
        project.coordinator = project.coordenador;
      }
      if (project.subCoordenador) {
        project.subCoordinator = project.subCoordenador;
      }
      return project as Project;
    });
  },
  create: async (data: CreateProjectData): Promise<{ message: string; project: Project }> => {
    const response = await api.post('/projects', data);
    return response.data;
  },
  update: async (id: number, data: Partial<CreateProjectData>): Promise<{ message: string; project: Project }> => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
  approve: async (id: number, action: 'approved' | 'rejected' | 'inactivated', notes?: string): Promise<{ message: string }> => {
    const response = await api.post(`/projects/${id}/approve`, { action, notes });
    return response.data;
  },
  addCollaborator: async (projectId: number, colaboradorId: number, colaboradorType: string): Promise<{ message: string; collaborator: Collaborator }> => {
    const response = await api.post(`/projects/${projectId}/collaborators`, {
      colaboradorId,
      colaboradorType
    });
    return response.data;
  },
  removeCollaborator: async (projectId: number, colaboradorId: number, colaboradorType: string): Promise<{ message: string }> => {
    const response = await api.delete(`/projects/${projectId}/collaborators/${colaboradorId}`, {
      data: { colaboradorType }
    });
    return response.data;
  },
  getAvailableCollaborators: async (projectId: number, tipo: string): Promise<User[]> => {
    const response = await api.get(`/projects/${projectId}/available-collaborators?tipo=${tipo}`);
    return response.data;
  },
  updateSubCoordinator: async (projectId: number, subCoordenadorId?: number, subCoordenadorType?: string): Promise<{ message: string; project: Project }> => {
    const response = await api.put(`/projects/${projectId}/sub-coordinator`, {
      subCoordenadorId,
      subCoordenadorType
    });
    return response.data;
  }
};

export const userService = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },
  getById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  update: async (id: number, data: Partial<User>): Promise<{ message: string; user: User }> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

export const adminService = {
  getStats: async (): Promise<AdminStats> => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
  getAdmins: async (): Promise<User[]> => {
    const response = await api.get('/admin/admins');
    return response.data;
  },
  promoteToAdmin: async (email: string): Promise<{ message: string }> => {
    const response = await api.post('/admin/promote', { email });
    return response.data;
  },
  demoteFromAdmin: async (userId: number): Promise<{ message: string }> => {
    const response = await api.post('/admin/demote', { userId });
    return response.data;
  },
  // Novas funções para coordenadores institucionais
  promoteToCoordinator: async (userId: number, tipo: 'pesquisa' | 'extensao'): Promise<{ message: string }> => {
    const response = await api.post('/admin/promote-coordinator', { userId, tipo });
    return response.data;
  },
  demoteFromCoordinator: async (userId: number): Promise<{ message: string }> => {
    const response = await api.post('/admin/demote-coordinator', { userId });
    return response.data;
  },
  getInstitutionalCoordinators: async (): Promise<InstitutionalCoordinator[]> => {
    const response = await api.get('/admin/coordinators/institutional');
    return response.data;
  },
  assignInstitutionalCoordinator: async (userId: number, tipo: 'pesquisa' | 'extensao'): Promise<{ message: string }> => {
    const response = await api.post('/admin/coordinators/assign', { userId, tipo });
    return response.data;
  },
  removeInstitutionalCoordinator: async (userId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/admin/coordinators/${userId}`);
    return response.data;
  }
};

// Novo serviço para coordenadores institucionais
export const institutionalCoordinatorService = {
  // Obter projetos supervisionados pelo coordenador institucional
  getSupervisedProjects: async (tipo?: 'pesquisa' | 'extensao'): Promise<Project[]> => {
    const params = tipo ? `?tipo=${tipo}` : '';
    const response = await api.get(`/coordinator/projects${params}`);
    return response.data;
  },
  // Aprovar/rejeitar projetos
  approveProject: async (projectId: number, action: 'approved' | 'rejected', notes?: string): Promise<{ message: string }> => {
    const response = await api.post(`/coordinator/projects/${projectId}/approve`, { action, notes });
    return response.data;
  },
  // Gerenciar colaboradores de um projeto
  getProjectCollaborators: async (projectId: number): Promise<Collaborator[]> => {
    const response = await api.get(`/coordinator/projects/${projectId}/collaborators`);
    return response.data;
  },
  // Atribuir sub-coordenador
  assignSubCoordinator: async (projectId: number, subCoordenadorId: number, subCoordenadorType: string): Promise<{ message: string }> => {
    const response = await api.post(`/coordinator/projects/${projectId}/sub-coordinator`, {
      subCoordenadorId,
      subCoordenadorType
    });
    return response.data;
  },
  // Remover sub-coordenador
  removeSubCoordinator: async (projectId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/coordinator/projects/${projectId}/sub-coordinator`);
    return response.data;
  }
};

// Interface para perfis públicos
export interface PublicProfile {
  id: number;
  name: string;
  email: string;
  type: 'docente' | 'servidor';
  biografia?: string;
  especialidades?: string;
  formacao?: string;
  area_atuacao?: string;
  telefone?: string;
  lattes?: string;
  linkedin?: string;
  foto_url?: string;
  matricula_siape?: string;
  coordenador_institucional?: {
    tipo: string;
    ativo: boolean;
  };
  projetos: {
    coordenador: Project[];
    sub_coordenador: Project[];
    colaborador: Project[];
    total: number;
    ativos: Project[];
  };
}

export interface PublicProfileSummary {
  id: number;
  name: string;
  type: 'docente' | 'servidor';
  area_atuacao?: string;
  especialidades?: string;
  foto_url?: string;
  coordenador_institucional?: {
    tipo: string;
    ativo: boolean;
  };
}

// Serviços de perfis públicos
export const profileService = {
  // Listar todos os perfis públicos
  getAll: async (filters?: {
    type?: 'docente' | 'servidor';
    area?: string;
    search?: string;
  }): Promise<{ profiles: PublicProfileSummary[], total: number }> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.area) params.append('area', filters.area);
    if (filters?.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const url = queryString ? `/profile?${queryString}` : '/profile';
    
    const response = await api.get(url);
    return response.data;
  },

  // Buscar perfis públicos sem paginação
  getPublicProfiles: async (): Promise<PublicProfileSummary[]> => {
    const response = await api.get('/profile');
    return response.data.profiles;
  },

  // Buscar perfil específico
  getById: async (id: number): Promise<PublicProfile> => {
    const response = await api.get(`/profile/${id}`);
    return response.data;
  }
};

export default api; 

// Serviços para upload de arquivos
export const uploadService = {
  async uploadAvatar(formData: FormData): Promise<{ user: User; message: string }> {
    const response = await api.post('/users/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async uploadProjectImages(projectId: number, formData: FormData): Promise<{ imageUrls: string[]; message: string }> {
    const response = await api.post(`/projects/${projectId}/upload-images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async uploadProjectVideos(projectId: number, formData: FormData): Promise<{ videoUrls: string[]; message: string }> {
    const response = await api.post(`/projects/${projectId}/upload-videos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Rota pública - todos os projetos (sem autenticação)
export const fetchPublicProjects = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`${API_BASE_URL}/api/v1/projects?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  
  if (!response.ok) {
    throw new Error('Erro ao buscar projetos públicos');
  }
  
  return response.json();
};

// Rota para projetos aprovados (aba "Projetos")
export const fetchApprovedProjects = async (filters = {}) => {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams(filters);
  
  const response = await fetch(`${API_BASE_URL}/api/v1/projects/approved?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Erro ao buscar projetos aprovados');
  }
  
  return response.json();
};

// Rota para painel administrativo (todos os projetos com filtros)
export const fetchAllProjectsAdmin = async (filters = {}) => {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams(filters);
  
  const response = await fetch(`${API_BASE_URL}/api/v1/projects/admin/all?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Erro ao buscar projetos para admin');
  }
  
  return response.json();
};