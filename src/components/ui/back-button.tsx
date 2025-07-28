import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  path?: string;
  label?: string;
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

export default function BackButton({
  path = "/",
  label = "Voltar",
  variant = "ghost",
  className = ""
}: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <Button
      variant={variant}
      onClick={() => navigate(path)}
      className={`flex items-center gap-2 ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Button>
  );
}
