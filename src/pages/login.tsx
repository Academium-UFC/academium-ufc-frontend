import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { FcGoogle } from "react-icons/fc"

export default function Login() {
  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo com fundo azul e imagens */}
      <div className="w-1/2 bg-[#002855] text-white flex flex-col items-center justify-center p-8">
        {/* Você pode substituir por <img src={LogoUFC} /> e ilustrações */}
        <h2 className="text-xl font-bold mb-4 text-center">Universidade Federal do Ceará</h2>
        <p className="text-center">Campus de Itapajé</p>
        {/* Espaço para as imagens ilustrativas */}
        <div className="mt-8 flex flex-col gap-10 items-center">
          <div className="bg-white/10 h-48 w-48 rounded-full"></div>
          <div className="bg-white/10 h-48 w-48 rounded-full"></div>
        </div>
      </div>

      {/* Lado direito com formulário */}
      <div className="w-1/2 flex flex-col justify-center items-center p-8 bg-white">
        <img src="/logo-ufc-preta.png" alt="Logo UFC" className="mb-4 w-32" />

        <h1 className="text-2xl font-bold text-center mb-6">Vitrine UFC - ITAPAJÉ</h1>

        <div className="w-full max-w-sm space-y-4">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 border rounded-full"
          >
            <FcGoogle className="text-xl" />
            Login through Google
          </Button>

          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
            <div className="h-px flex-1 bg-gray-300" />
            or
            <div className="h-px flex-1 bg-gray-300" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="matricula" className="text-blue-800 font-medium">
              Matrícula/SIAPE*
            </Label>
            <Input
              id="matricula"
              placeholder="Digite sua matrícula / siape"
              className="rounded-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="senha" className="text-blue-800 font-medium">
              Senha*
            </Label>
            <Input
              id="senha"
              type="password"
              placeholder="Digite sua senha"
              className="rounded-full"
            />
          </div>

          <div className="text-right text-sm">
            <a href="#" className="text-blue-600 hover:underline">
              Forgot your <span className="font-semibold">Password?</span>
            </a>
          </div>

          <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-full">
            Login
          </Button>
        </div>
      </div>
    </div>
  )
}
