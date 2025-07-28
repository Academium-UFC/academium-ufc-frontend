// Função para formatar telefone brasileiro
export const formatPhone = (value: string): string => {
  // Remove todos os caracteres não numéricos
  const cleaned = value.replace(/\D/g, '');
  
  // Aplica a formatação baseada no comprimento
  if (cleaned.length <= 2) {
    return `(${cleaned}`;
  } else if (cleaned.length <= 7) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  } else if (cleaned.length <= 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  } else {
    // Para celular com 9 dígitos
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
  }
};

// Função para limpar formatação do telefone (só números)
export const cleanPhone = (value: string): string => {
  return value.replace(/\D/g, '');
};

// Função para validar telefone brasileiro
export const validatePhone = (phone: string): boolean => {
  const cleaned = cleanPhone(phone);
  // Aceita telefone fixo (10 dígitos) ou celular (11 dígitos)
  return cleaned.length === 10 || cleaned.length === 11;
};

// Função para validar email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Função para validar URL
export const validateUrl = (url: string): boolean => {
  if (!url) return true; // URLs são opcionais
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Função para validar campos obrigatórios
export const validateRequiredField = (value: string, minLength: number = 1): boolean => {
  return value.trim().length >= minLength;
};

// Tipos para erros de validação
export interface ValidationError {
  field: string;
  message: string;
}

// Função principal de validação do perfil
export const validateProfileData = (data: {
  biografia?: string;
  area_atuacao?: string;
  especialidades?: string;
  telefone?: string;
  curriculo_lattes?: string;
  linkedin?: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validar biografia (mínimo 10 caracteres)
  if (!validateRequiredField(data.biografia || '', 10)) {
    errors.push({
      field: 'biografia',
      message: 'A biografia deve ter pelo menos 10 caracteres'
    });
  }

  // Validar área de atuação
  if (!validateRequiredField(data.area_atuacao || '', 3)) {
    errors.push({
      field: 'area_atuacao',
      message: 'A área de atuação deve ter pelo menos 3 caracteres'
    });
  }

  // Validar especialidades
  if (!validateRequiredField(data.especialidades || '', 5)) {
    errors.push({
      field: 'especialidades',
      message: 'As especialidades devem ter pelo menos 5 caracteres'
    });
  }

  // Validar telefone se fornecido
  if (data.telefone && !validatePhone(data.telefone)) {
    errors.push({
      field: 'telefone',
      message: 'Telefone deve ter formato válido (ex: (85) 99999-9999)'
    });
  }

  // Validar currículo Lattes (URL)
  if (data.curriculo_lattes && !validateUrl(data.curriculo_lattes)) {
    errors.push({
      field: 'curriculo_lattes',
      message: 'URL do Currículo Lattes deve ser válida'
    });
  }

  // Validar LinkedIn (URL)
  if (data.linkedin && !validateUrl(data.linkedin)) {
    errors.push({
      field: 'linkedin',
      message: 'URL do LinkedIn deve ser válida'
    });
  }

  return errors;
};
