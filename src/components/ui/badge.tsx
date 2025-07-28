import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-all duration-300 ease-in-out hover:scale-105 shadow-sm border",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300 hover:from-blue-200 hover:to-blue-300",
        secondary: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300 hover:from-gray-200 hover:to-gray-300",
        destructive: "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300 hover:from-red-200 hover:to-red-300",
        success: "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300 hover:from-green-200 hover:to-green-300",
        warning: "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300 hover:from-yellow-200 hover:to-yellow-300",
        outline: "text-gray-700 border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400",
        solid: "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 hover:from-blue-700 hover:to-blue-800 shadow-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

// Badge de status com indicador
interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'draft';
}

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const statusConfig = {
    active: { variant: 'success' as const, text: 'Ativo' },
    inactive: { variant: 'secondary' as const, text: 'Inativo' },
    pending: { variant: 'warning' as const, text: 'Pendente' },
    approved: { variant: 'success' as const, text: 'Aprovado' },
    rejected: { variant: 'destructive' as const, text: 'Rejeitado' },
    draft: { variant: 'outline' as const, text: 'Rascunho' },
  };

  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      className={cn("font-medium flex items-center gap-2", className)}
      {...props}
    >
      <div className={cn(
        "w-2 h-2 rounded-full",
        status === 'active' ? 'bg-green-500' :
        status === 'pending' ? 'bg-yellow-500' :
        status === 'approved' ? 'bg-green-500' :
        status === 'rejected' ? 'bg-red-500' :
        'bg-gray-400'
      )} />
      {config.text}
    </Badge>
  );
}

export { Badge, badgeVariants }
