import { Search, Menu, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import brasaoBrancoHorizontal from "../../assets/img/brasao-branco-horizontal.png";
export default function Projects() {
  const navigate = useNavigate();

  const [researchProjects, setResearchProjects] = useState(
    Array.from({ length: 1 }, (_, i) => ({
      id: i + 1,
      title: "Revista 2018",
      description: "Descrição do projeto de pesquisa desenvolvido no campus",
      image: "/placeholder.svg?height=120&width=120",
    }))
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  const handleAddProject = () => {
    const nextId = researchProjects.length + 1;
    setResearchProjects((prev) => [
      ...prev,
      {
        id: nextId,
        title: title || `Projeto ${nextId}`,
        description: description || "Sem descrição.",
        image: image || "/placeholder.svg?height=120&width=120",
      },
    ]);
    setTitle("");
    setDescription("");
    setImage("");
  };

  const removeProject = (id: number) => {
    setResearchProjects((prev) => prev.filter((project) => project.id !== id));
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img
                src={brasaoBrancoHorizontal}
                className="h-14 w-28 object-contain"
                alt="Logo UFC"
              />
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a
                onClick={() => navigate("/")}
                className="text-sm hover:text-blue-200 transition-colors cursor-pointer"
              >
                Início
              </a>
              <a
                onClick={() => navigate("/projetos")}
                className="text-sm hover:text-blue-200 transition-colors cursor-pointer"
              >
                Projetos
              </a>
            </nav>
            <Button variant="ghost" size="sm" className="md:hidden text-white">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <section className="bg-blue-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Vitrine de Projetos de Pesquisas
              </h1>
              <p className="text-lg text-blue-100 mb-8 leading-relaxed">
                A vitrine de projetos de pesquisa é um espaço dedicado à
                divulgação dos trabalhos científicos desenvolvidos na
                universidade, promovendo a visibilidade e o compartilhamento do
                conhecimento produzido em diversas áreas do saber.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="relative w-80 h-80">
                <img src="#" alt="" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar projetos de pesquisa..."
                className="pl-10 h-12 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <main className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Vitrine de Pesquisa
            </h2>
            <h3 className="text-2xl font-semibold text-blue-900 mb-2">
              Campus Itapajé
            </h3>
            <p className="text-lg text-gray-600">
              Principais Projetos de Pesquisa - Campus UFC Itapajé
            </p>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-2xl font-bold text-gray-900">Pesquisa</h4>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Adicionar Projeto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md w-full">
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Novo Projeto</h2>
                    <Input
                      placeholder="Título do projeto"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    <Textarea
                      placeholder="Descrição do projeto"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-gray-500" />
                      <Input
                        placeholder="URL da imagem (opcional)"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleAddProject} className="w-full">
                      Criar Projeto
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {researchProjects.map((project) => (
                <Card
                  key={project.id}
                  className="bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h5 className="font-semibold text-lg mb-2">
                          {project.title}
                        </h5>
                        <p className="text-sm text-blue-100 leading-relaxed">
                          {project.description}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeProject(project.id)}
                        className="flex items-center gap-1 mt-4"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remover
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-blue-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <img
              src={brasaoBrancoHorizontal}
              className="h-14 w-28 object-contain"
              alt="Logo UFC"
            />
            <div className="text-right">
              <p className="text-sm text-blue-200">
                © 2024 Universidade Federal do Ceará. Todos os direitos
                reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}