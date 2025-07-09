import axios, { type AxiosResponse, type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
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
    return Promise.reject(error);
  }
);

export type User = {
  id: number;
  name: string;
  email: string;
  type: 'admin' | 'docente' | 'discente' | 'servidor';
};

export type Project = {
  id: number;
  title: string;
  area: string;
  details: string;
  createdAt: string;
  updatedAt: string;
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
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export const projectService = {
  getAll: async (): Promise<Project[]> => {
    const response = await api.get('/projects');
    return response.data;
  },
  getById: async (id: number): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },
  getMyProjects: async (): Promise<Project[]> => {
    const response = await api.get('/projects/mine');
    return response.data;
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
};

export default api; 