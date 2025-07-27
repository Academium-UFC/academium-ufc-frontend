"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { 
  Edit, 
  Save, 
  X, 
  ArrowLeft,
  GraduationCap,
  BookOpen,
  Award,
  Calendar,
  Mail,
  Settings
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import brasaoBrancoHorizontal from "../../assets/img/brasao-branco-horizontal.png";

export default function UserProfile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("João Silva Santos");
  const [email, setEmail] = useState("joao.silva@alu.ufc.br");
  const [course, setCourse] = useState("Análise e Desenvolvimento de Sistemas");
  const [semester, setSemester] = useState("6º Semestre");
  const [bio, setBio] = useState(
    "Estudante apaixonado por tecnologia e desenvolvimento de software. Focado em criar soluções inovadoras para problemas reais."
  );
  const [skills] = useState(["React", "TypeScript", "Node.js", "Python", "Git", "MySQL"]);

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="bg-[#003366] text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img
                src={brasaoBrancoHorizontal}
                className="h-14 w-28 object-contain"
                alt="Logo UFC"
              />
              <div>
                <h1 className="text-xl font-bold">Academium UFC</h1>
                <p className="text-sm text-blue-200">Perfil do Estudante</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-[#003366]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-blue-100 p-8">
          <div className="flex flex-col items-center space-y-6">
            {/* Profile Image */}
            <div className="w-32 h-32 border-4 border-blue-500 shadow-lg ring-4 ring-blue-100 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {getInitials(name)}
              </span>
            </div>

            {/* Profile Info */}
            <div className="text-center w-full max-w-md">
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-center text-xl font-bold"
                    placeholder="Seu nome completo"
                  />
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-center"
                    placeholder="seu-email@alu.ufc.br"
                  />
                  <Input
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="text-center"
                    placeholder="Seu curso"
                  />
                  <Input
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="text-center"
                    placeholder="Semestre atual"
                  />
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="resize-none"
                    placeholder="Escreva uma breve descrição sobre você..."
                    rows={4}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{email}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      <span>{course}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{semester}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mt-4">
                    {bio}
                  </p>
                </div>
              )}
            </div>

            {/* Skills */}
            <div className="w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">
                Habilidades Técnicas
              </h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors text-sm px-3 py-1 rounded-full font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full max-w-md">
              {isEditing ? (
                <>
                  <Button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="w-full max-w-2xl mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Ações Rápidas
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2 border-blue-200 hover:bg-blue-50"
                  onClick={() => navigate("/projetos")}
                >
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  <span className="text-sm">Projetos</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2 border-green-200 hover:bg-green-50"
                  onClick={() => navigate("/admin")}
                >
                  <Award className="w-6 h-6 text-green-600" />
                  <span className="text-sm">Admin</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2 border-purple-200 hover:bg-purple-50"
                >
                  <Settings className="w-6 h-6 text-purple-600" />
                  <span className="text-sm">Configurações</span>
                </Button>
              </div>
            </div>

            {/* Academic Stats */}
            <div className="w-full max-w-2xl mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Estatísticas Acadêmicas
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">4</div>
                  <div className="text-sm text-gray-600">Projetos</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">8.7</div>
                  <div className="text-sm text-gray-600">CRA</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">195h</div>
                  <div className="text-sm text-gray-600">Complementares</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">2025.2</div>
                  <div className="text-sm text-gray-600">Formatura</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-[#003366] text-white py-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-blue-200">
            © 2025 Universidade Federal do Ceará - Campus Itapajé
          </p>
        </div>
      </footer>
    </div>
  );
}
