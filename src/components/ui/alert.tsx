import { AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorAlertProps {
  errors: Array<{ field: string; message: string }>;
  onClose?: () => void;
  className?: string;
}

export function ErrorAlert({ errors, onClose, className }: ErrorAlertProps) {
  if (!errors || errors.length === 0) return null;

  return (
    <div className={cn(
      "bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm animate-fade-in-up",
      className
    )}>
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-semibold text-red-800 mb-2">
            {errors.length === 1 ? 'Erro encontrado:' : `${errors.length} erros encontrados:`}
          </h3>
          <ul className="space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm text-red-700 flex items-start">
                <span className="w-1 h-1 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                <span>
                  <strong className="capitalize">{getFieldLabel(error.field)}:</strong> {error.message}
                </span>
              </li>
            ))}
          </ul>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-3 text-red-400 hover:text-red-600 transition-colors"
            aria-label="Fechar alerta"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Função auxiliar para traduzir nomes de campos
function getFieldLabel(fieldName: string): string {
  const labels: Record<string, string> = {
    biografia: 'biografia',
    area_atuacao: 'área de atuação',
    especialidades: 'especialidades',
    telefone: 'telefone',
    curriculo_lattes: 'currículo lattes',
    linkedin: 'linkedIn',
    formacao: 'formação',
    name: 'nome',
    email: 'email'
  };

  return labels[fieldName] || fieldName;
}

interface SuccessAlertProps {
  message: string;
  onClose?: () => void;
  className?: string;
}

export function SuccessAlert({ message, onClose, className }: SuccessAlertProps) {
  return (
    <div className={cn(
      "bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-sm animate-fade-in-up",
      className
    )}>
      <div className="flex items-start">
        <div className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-semibold text-green-800">
            {message}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-3 text-green-400 hover:text-green-600 transition-colors"
            aria-label="Fechar alerta"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
