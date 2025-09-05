"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Star,
  Plus,
  Search,
  BookOpen,
  Users,
  TrendingUp,
  Award,
  Clock,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import ElectiveRecommendations from "@/app/components/elective-recommendations"
import { MEDICINE_ELECTIVES } from "@/app/data/medicine-electives"

interface Assignment {
  id: string
  name: string
  code?: string
  credits: number
  year: number
  semester: number
  category: "core" | "elective" | "clinical" | "basic" | "internship"
  prerequisites: string[]
  completed: boolean
  instructor?: string
  schedule?: string
  location?: string
  description?: string
  requiresFullYear?: number[]
  orPrerequisites?: string[][]
  requiresAtLeastOne?: string[]
}

interface ElectiveOption {
  id: string
  name: string
  code: string
  credits: number
  dependencies: string[]
  requiresFullYear?: number[]
  description?: string
  area?: string
  skills?: string[]
  careerRelevance?: {
    [key: string]: number
  }
  difficulty?: number
  popularity?: number
  professor?: string
  schedule?: string
  prerequisites?: string[]
  rating?: number
  reviews?: number
  availableYears?: number[] // New field for multiple years
}

interface ElectivesManagerProps {
  assignments: Assignment[]
  onAddElective: (elective: Assignment) => void
  customElectives: ElectiveOption[]
  onUpdateCustomElectives: (electives: ElectiveOption[]) => void
}

// Additional elective assignments that are part of the curriculum options
const ADDITIONAL_ELECTIVES: ElectiveOption[] = [
  {
    id: "bcp1-1755282300000-0",
    name: "BASES CIENTÍFICAS DE LA PATOLOGÍA 1",
    code: "BCP1",
    credits: 18,
    dependencies: [],
    requiresFullYear: [1, 2, 3],
    description: "Fundamentos científicos de la patología médica - Primera parte",
    area: "Ciencias Básicas Clínicas",
    skills: ["pathology", "clinical_diagnosis", "medical_science"],
    careerRelevance: {
      internal_medicine: 85,
      pathologist: 95,
      researcher: 80,
      surgeon: 75,
    },
    difficulty: 8,
    popularity: 70,
    professor: "Dr. García Martínez",
    schedule: "Lun-Vie 8:00-12:00",
    rating: 4.2,
    reviews: 45,
    availableYears: [4, 5, 6, 7],
  },
  {
    id: "bcp2-1755282300001-0",
    name: "BASES CIENTÍFICAS DE LA PATOLOGÍA 2",
    code: "BCP2",
    credits: 17,
    dependencies: [],
    requiresFullYear: [1, 2, 3],
    description: "Fundamentos científicos de la patología médica - Segunda parte",
    area: "Ciencias Básicas Clínicas",
    skills: ["pathology", "clinical_diagnosis", "advanced_diagnostics"],
    careerRelevance: {
      internal_medicine: 85,
      pathologist: 95,
      researcher: 80,
      surgeon: 75,
    },
    difficulty: 8,
    popularity: 68,
    professor: "Dr. García Martínez",
    schedule: "Lun-Vie 8:00-12:00",
    rating: 4.3,
    reviews: 42,
    availableYears: [4, 5, 6, 7],
  },
  {
    id: "m4mc1-1755282300002-0",
    name: "MEDICINA COMUNITARIA 1",
    code: "M4MC1",
    credits: 10,
    dependencies: [],
    requiresFullYear: [1, 2, 3],
    description: "Introducción a la medicina comunitaria y salud pública",
    area: "Medicina Comunitaria",
    skills: ["community_health", "public_health", "epidemiology"],
    careerRelevance: {
      public_health: 95,
      family_medicine: 85,
      internal_medicine: 70,
    },
    difficulty: 6,
    popularity: 75,
    professor: "Dra. López Hernández",
    schedule: "Mar-Jue 14:00-18:00",
    rating: 4.1,
    reviews: 38,
    availableYears: [4, 5, 6, 7],
  },
  {
    id: "mpnal-1755282300003-0",
    name: "MEDICINA EN EL PRIMER NIVEL DE ATENCIÓN (LABORATORIO)",
    code: "MPNAl",
    credits: 10,
    dependencies: [],
    requiresFullYear: [1, 2, 3],
    description: "Práctica de laboratorio en medicina de primer nivel de atención",
    area: "Medicina Comunitaria",
    skills: ["primary_care", "laboratory_skills", "patient_management"],
    careerRelevance: {
      family_medicine: 90,
      internal_medicine: 75,
      public_health: 70,
    },
    difficulty: 7,
    popularity: 72,
    professor: "Dr. Rodríguez Silva",
    schedule: "Lun-Mie 9:00-13:00",
    rating: 4.0,
    reviews: 35,
    availableYears: [4, 5, 6, 7],
  },
]

export function ElectivesManager({
  assignments,
  onAddElective,
  customElectives,
  onUpdateCustomElectives,
}: ElectivesManagerProps) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("recommendations")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedArea, setSelectedArea] = useState<string>("all")
  const [selectedCareer, setSelectedCareer] = useState<string>("all")
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingElective, setEditingElective] = useState<ElectiveOption | null>(null)
  const [newElective, setNewElective] = useState({
    name: "",
    code: "",
    credits: 5,
    availableYears: [4] as number[],
    dependencies: [] as string[],
    description: "",
    area: "",
  })

  const completedAssignments = new Set(assignments.filter((a) => a.completed).map((a) => a.id))

  // Combine all electives: medicine electives + additional electives + custom electives
  const allElectives = [...MEDICINE_ELECTIVES, ...ADDITIONAL_ELECTIVES, ...customElectives]

  const availableElectives = allElectives.filter((elective) => {
    // Check if elective is available (prerequisites met)
    let prerequisitesMet = true

    // Check year requirements
    if (elective.requiresFullYear && Array.isArray(elective.requiresFullYear)) {
      prerequisitesMet = elective.requiresFullYear.every((year) => {
        const yearAssignments = assignments.filter((a) => a.year === year && a.category === "core")
        return yearAssignments.length > 0 && yearAssignments.every((a) => completedAssignments.has(a.id))
      })
    }

    // Check dependencies
    if (prerequisitesMet && elective.dependencies && Array.isArray(elective.dependencies)) {
      prerequisitesMet = elective.dependencies.every((dep) => completedAssignments.has(dep))
    }

    // Check if not already in assignments
    const notInAssignments = !assignments.some((a) => a.id === elective.id)

    return prerequisitesMet && notInAssignments
  })

  const filteredElectives = availableElectives.filter((elective) => {
    const matchesSearch =
      elective.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      elective.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesArea = selectedArea === "all" || elective.area === selectedArea
    return matchesSearch && matchesArea
  })

  const areas = Array.from(new Set(allElectives.map((e) => e.area).filter(Boolean)))

  const handleSelectElective = (elective: ElectiveOption, semester: number, selectedYear?: number) => {
    const year = selectedYear || (elective.requiresFullYear ? Math.max(...elective.requiresFullYear) + 1 : 4)

    const newAssignment: Assignment = {
      id: elective.id,
      name: elective.name,
      code: elective.code,
      credits: elective.credits,
      year: year,
      semester: semester,
      category: "elective",
      prerequisites: elective.dependencies || [],
      completed: false,
      description: elective.description,
      instructor: elective.professor,
      schedule: elective.schedule,
      requiresFullYear: elective.requiresFullYear,
    }
    onAddElective(newAssignment)
  }

  const handleAddCustomElective = () => {
    const customElective: ElectiveOption = {
      id: `custom-${Date.now()}`,
      name: newElective.name,
      code: newElective.code,
      credits: newElective.credits,
      dependencies: newElective.dependencies,
      description: newElective.description,
      area: newElective.area || "Optativa Personalizada",
      skills: [],
      careerRelevance: {},
      difficulty: 5,
      popularity: 50,
      rating: 0,
      reviews: 0,
      availableYears: newElective.availableYears,
    }

    // Add to custom electives list
    onUpdateCustomElectives([...customElectives, customElective])

    // Reset form
    setNewElective({
      name: "",
      code: "",
      credits: 5,
      availableYears: [4],
      dependencies: [],
      description: "",
      area: "",
    })

    // Switch to catalog tab to show the newly created elective
    setActiveTab("catalog")
  }

  const handleEditElective = (elective: ElectiveOption) => {
    setEditingElective(elective)
    setNewElective({
      name: elective.name,
      code: elective.code,
      credits: elective.credits,
      availableYears: elective.availableYears || [4],
      dependencies: elective.dependencies || [],
      description: elective.description || "",
      area: elective.area || "",
    })
    setShowEditDialog(true)
  }

  const handleUpdateElective = () => {
    if (!editingElective) return

    const updatedElective: ElectiveOption = {
      ...editingElective,
      name: newElective.name,
      code: newElective.code,
      credits: newElective.credits,
      dependencies: newElective.dependencies,
      description: newElective.description,
      area: newElective.area || "Optativa Personalizada",
      availableYears: newElective.availableYears,
    }

    const updatedElectives = customElectives.map((e) => (e.id === editingElective.id ? updatedElective : e))
    onUpdateCustomElectives(updatedElectives)

    setShowEditDialog(false)
    setEditingElective(null)
    setNewElective({
      name: "",
      code: "",
      credits: 5,
      availableYears: [4],
      dependencies: [],
      description: "",
      area: "",
    })
  }

  const handleDeleteElective = (elective: ElectiveOption) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta optativa?")) {
      const updatedElectives = customElectives.filter((e) => e.id !== elective.id)
      onUpdateCustomElectives(updatedElectives)
    }
  }

  const toggleYear = (year: number) => {
    setNewElective((prev) => ({
      ...prev,
      availableYears: prev.availableYears.includes(year)
        ? prev.availableYears.filter((y) => y !== year)
        : [...prev.availableYears, year].sort(),
    }))
  }

  const toggleDependency = (assignmentId: string) => {
    setNewElective((prev) => ({
      ...prev,
      dependencies: prev.dependencies.includes(assignmentId)
        ? prev.dependencies.filter((id) => id !== assignmentId)
        : [...prev.dependencies, assignmentId],
    }))
  }

  const availableDependencies = assignments.filter((a) => a.category === "core" || a.category === "elective")

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-600" />
            Gestión de Optativas de Medicina
          </CardTitle>
          <CardDescription>Explora y selecciona optativas para personalizar tu formación médica</CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Recomendaciones IA
          </TabsTrigger>
          <TabsTrigger value="catalog" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Catálogo Completo
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Crear Optativa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-6">
          <ElectiveRecommendations
            assignments={assignments}
            completedAssignments={completedAssignments}
            availableElectives={allElectives}
            career={selectedCareer}
            maxYear={7}
            onSelectElective={handleSelectElective}
          />
        </TabsContent>

        <TabsContent value="catalog" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar optativas por nombre o código..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedArea} onValueChange={setSelectedArea}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrar por área" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las áreas</SelectItem>
                      {areas.map((area) => (
                        <SelectItem key={area} value={area}>
                          {area}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Electives Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredElectives.map((elective) => {
              const isCustom = customElectives.some((ce) => ce.id === elective.id)

              return (
                <Card key={elective.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs font-mono">
                            {elective.code}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {elective.credits} créditos
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-sm mb-2 line-clamp-2">{elective.name}</h4>
                      </div>
                      {isCustom && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditElective(elective)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteElective(elective)} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    {elective.area && <Badge className="mb-2 text-xs bg-blue-100 text-blue-800">{elective.area}</Badge>}

                    <p className="text-xs text-gray-600 mb-3 line-clamp-3">{elective.description}</p>

                    {/* Available Years */}
                    {elective.availableYears && elective.availableYears.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-700 mb-1">Años disponibles:</p>
                        <div className="flex flex-wrap gap-1">
                          {elective.availableYears.map((year) => (
                            <Badge key={year} variant="outline" className="text-xs">
                              {year}°
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Additional Info */}
                    <div className="space-y-2 mb-3">
                      {elective.professor && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Users className="w-3 h-3" />
                          <span>{elective.professor}</span>
                        </div>
                      )}
                      {elective.schedule && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Clock className="w-3 h-3" />
                          <span>{elective.schedule}</span>
                        </div>
                      )}
                      {elective.rating && elective.rating > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Award className="w-3 h-3" />
                          <span>
                            {elective.rating.toFixed(1)} ⭐ ({elective.reviews} reseñas)
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    {elective.skills && elective.skills.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-700 mb-1">Habilidades:</p>
                        <div className="flex flex-wrap gap-1">
                          {elective.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill.replace(/_/g, " ")}
                            </Badge>
                          ))}
                          {elective.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{elective.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Year Selection for Multi-Year Electives */}
                    {elective.availableYears && elective.availableYears.length > 1 ? (
                      <div className="space-y-2">
                        <p className="text-xs font-medium">Seleccionar año:</p>
                        <div className="grid grid-cols-2 gap-1">
                          {elective.availableYears.map((year) => (
                            <div key={year} className="space-y-1">
                              <p className="text-xs text-center">{year}° Año</p>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  onClick={() => handleSelectElective(elective, 1, year)}
                                  className="flex-1 text-xs py-1"
                                >
                                  S1
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSelectElective(elective, 2, year)}
                                  className="flex-1 text-xs py-1"
                                >
                                  S2
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSelectElective(elective, 1)} className="flex-1">
                          Agregar S1
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSelectElective(elective, 2)}
                          className="flex-1"
                        >
                          Agregar S2
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredElectives.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No hay optativas disponibles</h3>
                <p className="text-sm text-gray-500">
                  Completa más materias básicas para desbloquear optativas o ajusta los filtros de búsqueda
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Crear Optativa Personalizada</CardTitle>
              <CardDescription>
                Agrega una optativa personalizada que aparecerá en el catálogo para ser seleccionada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Información Básica</TabsTrigger>
                  <TabsTrigger value="years">Años Disponibles</TabsTrigger>
                  <TabsTrigger value="dependencies">Dependencias</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nombre de la Optativa</Label>
                      <Input
                        id="name"
                        value={newElective.name}
                        onChange={(e) => setNewElective({ ...newElective, name: e.target.value })}
                        placeholder="Ej: Medicina Tropical Avanzada"
                      />
                    </div>
                    <div>
                      <Label htmlFor="code">Código</Label>
                      <Input
                        id="code"
                        value={newElective.code}
                        onChange={(e) => setNewElective({ ...newElective, code: e.target.value })}
                        placeholder="Ej: MTA"
                      />
                    </div>
                    <div>
                      <Label htmlFor="credits">Créditos</Label>
                      <Select
                        value={newElective.credits.toString()}
                        onValueChange={(value) => setNewElective({ ...newElective, credits: Number.parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[3, 4, 5, 6, 8, 10].map((credits) => (
                            <SelectItem key={credits} value={credits.toString()}>
                              {credits} créditos
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="area">Área (Opcional)</Label>
                      <Input
                        id="area"
                        value={newElective.area}
                        onChange={(e) => setNewElective({ ...newElective, area: e.target.value })}
                        placeholder="Ej: Medicina Tropical"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={newElective.description}
                      onChange={(e) => setNewElective({ ...newElective, description: e.target.value })}
                      placeholder="Describe el contenido y objetivos de la optativa..."
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="years" className="space-y-4">
                  <div>
                    <Label>Años en los que se puede tomar esta optativa</Label>
                    <p className="text-sm text-gray-600 mb-3">
                      Selecciona todos los años en los que esta optativa puede ser cursada
                    </p>
                    <div className="grid grid-cols-4 gap-4">
                      {[1, 2, 3, 4, 5, 6, 7].map((year) => (
                        <div key={year} className="flex items-center space-x-2">
                          <Checkbox
                            id={`year-${year}`}
                            checked={newElective.availableYears.includes(year)}
                            onCheckedChange={() => toggleYear(year)}
                          />
                          <Label htmlFor={`year-${year}`} className="text-sm">
                            {year}° Año
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="dependencies" className="space-y-4">
                  <div>
                    <Label>Dependencias (Opcional)</Label>
                    <p className="text-sm text-gray-600 mb-3">
                      Selecciona las materias que deben estar completadas antes de tomar esta optativa
                    </p>
                    <div className="max-h-64 overflow-y-auto border rounded-md p-3 space-y-2">
                      {availableDependencies.map((assignment) => (
                        <div key={assignment.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={assignment.id}
                            checked={newElective.dependencies.includes(assignment.id)}
                            onCheckedChange={() => toggleDependency(assignment.id)}
                          />
                          <Label htmlFor={assignment.id} className="flex-1 text-sm">
                            {assignment.code} - {assignment.name}
                          </Label>
                          <Badge variant="outline" className="text-xs">
                            {assignment.year}° Año
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <Button
                onClick={handleAddCustomElective}
                disabled={!newElective.name || !newElective.code || newElective.availableYears.length === 0}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear y Agregar al Catálogo
              </Button>

              {customElectives.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    ✅ Has creado {customElectives.length} optativa{customElectives.length !== 1 ? "s" : ""}{" "}
                    personalizada{customElectives.length !== 1 ? "s" : ""}. Puedes encontrarla
                    {customElectives.length !== 1 ? "s" : ""} en el Catálogo Completo.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Optativa</DialogTitle>
            <DialogDescription>Modifica los detalles de la optativa personalizada</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Información Básica</TabsTrigger>
                <TabsTrigger value="years">Años Disponibles</TabsTrigger>
                <TabsTrigger value="dependencies">Dependencias</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Nombre de la Optativa</Label>
                    <Input
                      id="edit-name"
                      value={newElective.name}
                      onChange={(e) => setNewElective({ ...newElective, name: e.target.value })}
                      placeholder="Ej: Medicina Tropical Avanzada"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-code">Código</Label>
                    <Input
                      id="edit-code"
                      value={newElective.code}
                      onChange={(e) => setNewElective({ ...newElective, code: e.target.value })}
                      placeholder="Ej: MTA"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-credits">Créditos</Label>
                    <Select
                      value={newElective.credits.toString()}
                      onValueChange={(value) => setNewElective({ ...newElective, credits: Number.parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[3, 4, 5, 6, 8, 10].map((credits) => (
                          <SelectItem key={credits} value={credits.toString()}>
                            {credits} créditos
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-area">Área (Opcional)</Label>
                    <Input
                      id="edit-area"
                      value={newElective.area}
                      onChange={(e) => setNewElective({ ...newElective, area: e.target.value })}
                      placeholder="Ej: Medicina Tropical"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-description">Descripción</Label>
                  <Textarea
                    id="edit-description"
                    value={newElective.description}
                    onChange={(e) => setNewElective({ ...newElective, description: e.target.value })}
                    placeholder="Describe el contenido y objetivos de la optativa..."
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="years" className="space-y-4">
                <div>
                  <Label>Años en los que se puede tomar esta optativa</Label>
                  <p className="text-sm text-gray-600 mb-3">
                    Selecciona todos los años en los que esta optativa puede ser cursada
                  </p>
                  <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7].map((year) => (
                      <div key={year} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-year-${year}`}
                          checked={newElective.availableYears.includes(year)}
                          onCheckedChange={() => toggleYear(year)}
                        />
                        <Label htmlFor={`edit-year-${year}`} className="text-sm">
                          {year}° Año
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="dependencies" className="space-y-4">
                <div>
                  <Label>Dependencias (Opcional)</Label>
                  <p className="text-sm text-gray-600 mb-3">
                    Selecciona las materias que deben estar completadas antes de tomar esta optativa
                  </p>
                  <div className="max-h-64 overflow-y-auto border rounded-md p-3 space-y-2">
                    {availableDependencies.map((assignment) => (
                      <div key={assignment.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-${assignment.id}`}
                          checked={newElective.dependencies.includes(assignment.id)}
                          onCheckedChange={() => toggleDependency(assignment.id)}
                        />
                        <Label htmlFor={`edit-${assignment.id}`} className="flex-1 text-sm">
                          {assignment.code} - {assignment.name}
                        </Label>
                        <Badge variant="outline" className="text-xs">
                          {assignment.year}° Año
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateElective}
                disabled={!newElective.name || !newElective.code || newElective.availableYears.length === 0}
              >
                Actualizar Optativa
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
