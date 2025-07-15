"use client"

import { useState } from "react"
import {  Menu, Plus, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import brasaoBrancoHorizontal from "../../assets/img/brasao-branco-horizontal.png";

export default function ResearchShowcase() {
  const [researchProjects, setResearchProjects] = useState([
    {
      id: 1,
      title: "Revista 2018",
      description: "Descrição do projeto de pesquisa desenvolvido no campus",
      image: "/placeholder.svg?height=120&width=120",
    },
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
const [selectedProject, setSelectedProject] = useState<null | typeof researchProjects[0]>(null)
const [showModal, setShowModal] = useState(false)


  const handleAddProject = () => {
    if (title.trim()) {
        setImageUrl("")
      const newProject = {
        id: Date.now(),
        title: title.trim(),
        description: description.trim() || "Sem descrição.",
   image: imageUrl.trim() || "/placeholder.svg?height=120&width=120",
   
      }
      setResearchProjects((prev) => [...prev, newProject])
      setTitle("")
      setDescription("")
      setShowAddForm(false)
    }
  }

  const removeProject = (id: number) => {
    setResearchProjects((prev) => prev.filter((project) => project.id !== id))
  }
  const navigate = useNavigate ()
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-[#003366] text-white">
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
              <a href="#" 
              onClick={() => navigate("/")}
              className="text-sm hover:text-blue-200 transition-colors font-medium">
                Início
              </a>
              <a href="#" 
              onClick={() => navigate("/projetos")}
              className="text-sm hover:text-blue-200 transition-colors font-medium">
                Projetos
              </a>
            </nav>
            <button className="md:hidden text-white">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <section className="bg-[#003366] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Vitrine de Projetos de Pesquisas</h1>
              <p className="text-lg text-blue-100 mb-8 leading-relaxed">
                A vitrine de projetos de pesquisa é um espaço dedicado à divulgação dos trabalhos científicos
                desenvolvidos na universidade, promovendo a visibilidade e o compartilhamento do conhecimento produzido
                em diversas áreas do saber.
              </p>
            </div>
            
          </div>
        </div>
      </section>

      <main className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Vitrine de Pesquisa</h2>
            <h3 className="text-2xl font-semibold text-blue-900 mb-2">Campus Itapajé</h3>
            <p className="text-lg text-gray-600">Principais Projetos de Pesquisa - Campus UFC Itapajé</p>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-2xl font-bold text-gray-900">Pesquisa</h4>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 bg-[#003366] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" /> Adicionar Projeto
              </button>
            </div>

            {showAddForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                  <h2 className="text-lg font-semibold mb-4">Novo Projeto</h2>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Título do projeto"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
  placeholder="Descrição do projeto"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  rows={3}
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
/>

<input
  type="text"
  placeholder="URL da imagem do projeto (opcional)"
  value={imageUrl}
  onChange={(e) => setImageUrl(e.target.value)}
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
/>

                    <div className="flex gap-2">
                      <button
                        onClick={handleAddProject}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Criar Projeto
                      </button>
                      <button
                        onClick={() => setShowAddForm(false)}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {researchProjects.map((project) => (
                <div
  key={project.id}
  className="bg-[#003366] text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
  onClick={() => {
    setSelectedProject(project)
    setShowModal(true)
  }}
>

                  <div className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <img
                        src={project.image || "/placeholder.svg"}
                        alt={project.title}
                        className="w-16 h-16 rounded-full object-cover bg-blue-500"
                      />
                      <div>
                        <h5 className="font-semibold text-lg mb-2">{project.title}</h5>
                        <p className="text-sm text-blue-100 leading-relaxed">{project.description}</p>
                      </div>
                      <button
                        onClick={() => removeProject(project.id)}
                        className="flex items-center gap-1 mt-4 bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {showModal && selectedProject && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4">
    <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
        onClick={() => setShowModal(false)}
      >
        ✕
      </button>
      <div className="flex flex-col items-center text-center space-y-4">
        <img
          src={selectedProject.image}
          alt={selectedProject.title}
          className="w-32 h-32 rounded-full object-cover bg-gray-200"
        />
        <h2 className="text-2xl font-bold text-gray-900">{selectedProject.title}</h2>
        <p className="text-gray-700">{selectedProject.description}</p>
      </div>
    </div>
  </div>
)}

      </main>

      <footer className="bg-[#003366] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
         <img
              src={brasaoBrancoHorizontal}
              className="h-14 w-28 object-contain"
              alt="Logo UFC"
            />
            <div className="text-right">
              <p className="text-sm text-blue-200">
                © 2024 Universidade Federal do Ceará. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}