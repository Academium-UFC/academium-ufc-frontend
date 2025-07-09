import axios from 'axios';

// Configuração base da API
const API_BASE_URL = 'http://localhost:3000/api/v1';

// Instância do axios com configurações padrão
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Tipos para as respostas da API
export interface User {
  id: number;
  name: string;
  email: string;
  type: 'admin' | 'docente' | 'discente' | 'servidor';
}

export interface Project {
  id: number;
  title: string;
  area: string;
  details: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

// Substituir a interface RegisterData por type
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
}

// Serviços da API
export const authService = {
  // Registro de usuário
  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Login
  login: async (data: LoginData): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  // Obter dados do usuário logado
  me: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Logout (remove token do localStorage)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export const projectService = {
  // Listar todos os projetos (público)
  getAll: async (): Promise<Project[]> => {
    const response = await api.get('/projects');
    return response.data;
  },

  // Obter projeto por ID
  getById: async (id: number): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  // Listar projetos do usuário logado
  getMyProjects: async (): Promise<Project[]> => {
    const response = await api.get('/projects/mine');
    return response.data;
  },

  // Criar novo projeto
  create: async (data: CreateProjectData): Promise<{ message: string; project: Project }> => {
    const response = await api.post('/projects', data);
    return response.data;
  },

  // Atualizar projeto
  update: async (id: number, data: Partial<CreateProjectData>): Promise<{ message: string; project: Project }> => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },

  // Deletar projeto
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  // Aprovar/rejeitar projeto (apenas admin)
  approve: async (id: number, action: 'approved' | 'rejected' | 'inactivated', notes?: string): Promise<{ message: string }> => {
    const response = await api.post(`/projects/${id}/approve`, { action, notes });
    return response.data;
  },
};

export default api; 