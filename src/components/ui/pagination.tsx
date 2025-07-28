import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages();

  return (
    <nav className={cn("flex items-center justify-center space-x-1", className)} role="navigation" aria-label="Pagination">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          "inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out",
          "border-2 border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200",
          "hover:shadow-md hover:scale-105 active:scale-95 transform",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        )}
        aria-label="Página anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {visiblePages.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`dots-${index}`}
                className="inline-flex items-center justify-center w-10 h-10 text-gray-500"
              >
                <MoreHorizontal className="w-4 h-4" />
              </span>
            );
          }

          const pageNumber = page as number;
          const isActive = pageNumber === currentPage;

          return (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              className={cn(
                "inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out transform",
                "hover:scale-105 active:scale-95 hover:shadow-md",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-2 border-blue-600 shadow-lg hover:from-blue-700 hover:to-blue-800"
                  : "border-2 border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 text-gray-700"
              )}
              aria-label={`Página ${pageNumber}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          "inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out",
          "border-2 border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200",
          "hover:shadow-md hover:scale-105 active:scale-95 transform",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        )}
        aria-label="Próxima página"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Page Info */}
      <div className="ml-4 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border">
        Página {currentPage} de {totalPages}
      </div>
    </nav>
  );
}

// Componente de paginação simples para casos menores
export function SimplePagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          "inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ease-in-out",
          "border-2 border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "hover:shadow-md hover:scale-105 active:scale-95 transform",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        )}
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Anterior
      </button>

      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border">
          {currentPage} / {totalPages}
        </span>
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          "inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ease-in-out",
          "border-2 border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "hover:shadow-md hover:scale-105 active:scale-95 transform",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        )}
      >
        Próximo
        <ChevronRight className="w-4 h-4 ml-2" />
      </button>
    </div>
  );
}
