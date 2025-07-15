import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import brasaoBrancoHorizontal from "../../assets/img/brasao-branco-horizontal.png";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "../../components/ui/dialog";
import { useState } from "react";

import { useNavigate } from "react-router-dom";
import campus from "../../assets/img/ufc.jpg";
import joao from "../../assets/img/joao.jpg"
import anderson from "../../assets/img/anderson.jpg"
import israel from "../../assets/img/israel.jpg"
import  fenner from "../../assets/img/fenner.jpg"
import julio from "../../assets/img/julio.jpg"
export default function Home() {
  const navigate = useNavigate();
  const idealizadores = [
  {
    nome: "Anderson Uchôa",
    imagem: anderson,
  },
  {
    nome: "Israel Eduardo",
    imagem: israel,
  },
  {
    nome: "Germano Fenner",
    imagem: fenner,
  },
  {
    nome: "Júlio César",
    imagem: julio,
  },
];
const [projetoAberto, setProjetoAberto] = useState<number | null>(null);


  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-[#003366] text-white py-4 shadow-lg">
        <div className="flex items-center justify-between w-full px-4 lg:px-8">
          <div className="flex items-center gap-6">
            <img
              src={brasaoBrancoHorizontal}
              className="h-14 w-28 object-contain"
              alt="Logo UFC"
            />
            <nav className="hidden md:flex items-center gap-6">
              <a
                onClick={() => navigate("/")}
                className="hover:text-blue-200 transition-colors font-medium"
              >
                Início
              </a>
              <a
                onClick={() => navigate("/projetos")}
                className="hover:text-blue-200 transition-colors font-medium"
              >
                Projetos
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <button className="w-10 h-10 rounded-full bg-white text-[#003366] flex items-center justify-center text-lg font-bold shadow-sm hover:shadow-md transition-shadow">
                  👤
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Bem-vindo(a)</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 mt-4">
                  <Button
                    onClick={() => navigate("/login")}
                    className="bg-[#003366] text-white hover:bg-[#002244]"
                  >
                    Fazer Login
                  </Button>
                  <Button
                    onClick={() => navigate("/cadastro")}
                    className="bg-[#003366] text-white hover:bg-[#002244]"
                  >
                    Cadastre-se
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <section className="bg-[#004080] text-white px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Novo projeto de pesquisa conta com projeto de...
          </h1>
          <p className="text-xl mb-8 text-blue-100">
            Veja os últimos avanços da nossa comunidade acadêmica
          </p>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Projetos recentes
            </h2>
            <p className="text-lg text-gray-600">
              Recente. Populares. Projetos.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 1 }).map((_, i) => (
              <Dialog open={projetoAberto === i} onOpenChange={(open) => setProjetoAberto(open ? i : null)}>
  <DialogTrigger asChild>
    <Card
      key={i}
      className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md cursor-pointer"
    >
      <CardContent className="p-6">
        <div className="w-full h-48 bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
          <div className="w-16 h-16 bg-[#003366] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">
              {i + 1}
            </span>
          </div>
        </div>
        <h3 className="font-bold text-xl mb-3 text-gray-800">
          Título do Projeto {i + 1}
        </h3>
        <p className="text-gray-600 leading-relaxed">
          Descrição breve sobre o projeto realizado e seus impactos na
          comunidade acadêmica...
        </p>
      </CardContent>
    </Card>
  </DialogTrigger>

  <DialogContent className="max-w-xl">
    <DialogHeader>
      <DialogTitle>Detalhes do Projeto {i + 1}</DialogTitle>
    </DialogHeader>
    <div className="mt-4 text-gray-700 text-sm">
      <p><strong>Resumo:</strong> Este é um projeto de destaque da nossa comunidade acadêmica. Ele visa promover avanços na área de pesquisa e inovação, com impacto direto na sociedade.</p>
      <p className="mt-2">Você pode entrar em contato com os responsáveis para saber mais ou acompanhar os próximos passos do projeto.</p>
    </div>
  </DialogContent>
</Dialog>

            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Nossos idealizadores
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col items-center md:items-start">
              <img
                src={joao}
                  alt="Idealizador 1"
                    className="w-64 h-64 rounded-full mb-6 object-cover shadow-lg"
                    />

              <h3 className="text-2xl font-bold mb-3 text-gray-800">
                João Henrique Gonçalves Corrêa
              </h3>
              <p className="text-[#003366] mb-2 font-medium">
                Professor Adjunto
              </p>
              <p className="text-gray-600">E-mail: joaocorrea@ufc.com.br</p>
            </div>
           
             <Carousel>
  <CarouselContent>
    {idealizadores.map((pessoa, i) => (
      <CarouselItem key={i} className="p-4">
        <div className="text-center">
          <img
            src={pessoa.imagem}
            alt={`Foto de ${pessoa.nome}`}
            className="w-54 h-54 rounded-full mx-auto mb-4 object-cover shadow-sm"
          />
          <p className="text-sm font-medium text-gray-700">{pessoa.nome}</p>
        </div>
      </CarouselItem>
    ))}
  </CarouselContent>
  <CarouselPrevious className="bg-white shadow-md hover:bg-gray-50" />
  <CarouselNext className="bg-white shadow-md hover:bg-gray-50" />
</Carousel>

            
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Nosso campus
            </h2>
            <p className="text-lg text-gray-600">
              Conheça mais sobre nossa estrutura
            </p>
          </div>
          <div className="relative aspect-video bg-gray-200 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
            <img src={campus} />
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Localização
            </h2>
          </div>
          <div className="w-full h-80 bg-gray-200 rounded-xl shadow-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#003366] rounded-full mx-auto mb-4 flex items-center justify-center shadow-md">
                <span className="text-white text-2xl"></span>
              </div>
              <p className="text-gray-600 font-medium">
                Mapa interativo em breve
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#003366] text-white py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-4 text-lg font-medium">
            © 2025 Universidade Federal do Ceará - Campus Itapajé
          </div>
        </div>
      </footer>
    </div>
  );
}