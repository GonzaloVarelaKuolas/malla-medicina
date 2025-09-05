"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, BookOpen, Star, Clock, Users, Plus, Minus, GraduationCap, TrendingUp } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import ElectiveRecommendations from "./elective-recommendations"
import { MEDICINE_ELECTIVES } from "../data/medicine-electives"

interface Assignment {
  id: string
  name: string
  code: string
  credits: number
  year: number
  semester: 1 | 2
  dependencies: string[]
  category: "core" | "elective"
  requiresFullYear?: number[]
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
}

interface ElectiveManagerProps {
  isOpen: boolean
  onClose: () => void
  onAddElectives: (electives: Assignment[]) => void
  existingAssignments: Assignment[]
  completedAssignments: Set<string>
  career: string | null
  maxYear: number
}

export function ElectiveManager({
  isOpen,
  onClose,
  onAddElectives,
  existingAssignments = [],
  completedAssignments = new Set(),
  career,
  maxYear = 7,
}: ElectiveManagerProps) {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedArea, setSelectedArea] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name")
  const [selectedElectives, setSelectedElectives] = useState<ElectiveOption[]>([])
  const [selectedElective, setSelectedElective] = useState<ElectiveOption | null>(null)
  const [selectedSemester, setSelectedSemester] = useState<number>(1)

  // Get available electives based on career
  const availableElectives: ElectiveOption[] = career === "medicine" ? MEDICINE_ELECTIVES : []

  // Get unique areas with proper null checks
  const areas = useMemo(() => {
    if (!Array.isArray(availableElectives)) return []
    const uniqueAreas = [...new Set(availableElectives.map((e) => e.area).filter(Boolean))]
    return uniqueAreas.sort()
  }, [availableElectives])

  // Filter and sort electives with proper null checks
  const filteredElectives = useMemo(() => {
    if (!Array.isArray(availableElectives)) return []

    const filtered = availableElectives.filter((elective) => {
      if (!elective) return false

      // Search filter
      const matchesSearch =
        (elective.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (elective.code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (elective.description || "").toLowerCase().includes(searchTerm.toLowerCase())

      // Area filter
      const matchesArea = selectedArea === "all" || elective.area === selectedArea

      // Not already selected
      const notSelected = !selectedElectives.some((selected) => selected && selected.id === elective.id)

      // Not already in assignments
      const notInAssignments = !existingAssignments.some((assignment) => assignment && assignment.id === elective.id)

      return matchesSearch && matchesArea && notSelected && notInAssignments
    })

    // Sort
    filtered.sort((a, b) => {
      if (!a || !b) return 0

      switch (sortBy) {
        case "name":
          return (a.name || "").localeCompare(b.name || "")
        case "difficulty":
          return (a.difficulty || 0) - (b.difficulty || 0)
        case "popularity":
          return (b.popularity || 0) - (a.popularity || 0)
        case "rating":
          return (b.rating || 0) - (a.rating || 0)
        case "credits":
          return (b.credits || 0) - (a.credits || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [availableElectives, searchTerm, selectedArea, sortBy, selectedElectives, existingAssignments])

  // Check if elective is available (prerequisites met)
  const isElectiveAvailable = (elective: ElectiveOption) => {
    if (!elective) return false
    if (!completedAssignments) return true
    if (!Array.isArray(existingAssignments)) return true

    // Check year requirements
    if (elective.requiresFullYear && Array.isArray(elective.requiresFullYear)) {
      const yearRequirementsMet = elective.requiresFullYear.every((year) => {
        const yearAssignments = existingAssignments.filter((a) => a && a.year === year && a.category === "core")
        return yearAssignments.every((a) => a && completedAssignments.has(a.id))
      })
      if (!yearRequirementsMet) return false
    }

    // Check dependencies
    if (elective.dependencies && Array.isArray(elective.dependencies)) {
      const dependenciesMet = elective.dependencies.every((dep) => completedAssignments.has(dep))
      if (!dependenciesMet) return false
    }

    return true
  }

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return "text-green-600 bg-green-100"
    if (difficulty <= 3) return "text-yellow-600 bg-yellow-100"
    if (difficulty <= 4) return "text-orange-600 bg-orange-100"
    return "text-red-600 bg-red-100"
  }

  const getDifficultyText = (difficulty: number) => {
    if (difficulty <= 2) return "Fácil"
    if (difficulty <= 3) return "Moderado"
    if (difficulty <= 4) return "Difícil"
    return "Muy Difícil"
  }

  const handleAddElective = (elective: ElectiveOption) => {
    if (!selectedElectives.some((e) => e.id === elective.id)) {
      setSelectedElectives([...selectedElectives, elective])
    }
  }

  const handleRemoveElective = (electiveId: string) => {
    setSelectedElectives(selectedElectives.filter((e) => e.id !== electiveId))
  }

  const handleAddSelectedElectives = () => {
    const electivesToAdd: Assignment[] = selectedElectives.map((elective, index) => ({
      id: elective.id,
      name: elective.name,
      code: elective.code,
      credits: elective.credits,
      year: Math.min(maxYear, Math.max(1, Math.ceil((index + 1) / 2) + 2)), // Distribute across years
      semester: ((index % 2) + 1) as 1 | 2,
      dependencies: elective.dependencies || [],
      category: "elective" as const,
      requiresFullYear: elective.requiresFullYear,
    }))

    onAddElectives(electivesToAdd)
    setSelectedElectives([])
    onClose()
  }

  const handleSelectElectiveForSemester = (elective: ElectiveOption, semester: number) => {
    const year = Math.ceil(semester / 2)
    const semesterInYear = ((semester - 1) % 2) + 1

    const electiveToAdd: Assignment = {
      id: elective.id,
      name: elective.name,
      code: elective.code,
      credits: elective.credits,
      year: year,
      semester: semesterInYear as 1 | 2,
      dependencies: elective.dependencies || [],
      category: "elective" as const,
      requiresFullYear: elective.requiresFullYear,
    }

    onAddElectives([electiveToAdd])
    setSelectedElective(null)
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Gestión de Optativas Médicas
          </DialogTitle>
          <DialogDescription>Explora y selecciona optativas especializadas para tu carrera médica</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Explorar Optativas
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Recomendaciones IA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Buscar optativas médicas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedArea} onValueChange={setSelectedArea}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filtrar por área" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las áreas</SelectItem>
                        {Array.isArray(areas) &&
                          areas.map((area) => (
                            <SelectItem key={area} value={area}>
                              {area}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Ordenar por" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Nombre</SelectItem>
                        <SelectItem value="difficulty">Dificultad</SelectItem>
                        <SelectItem value="popularity">Popularidad</SelectItem>
                        <SelectItem value="rating">Calificación</SelectItem>
                        <SelectItem value="credits">Créditos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Electives Summary */}
            {selectedElectives.length > 0 && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">
                        {selectedElectives.length} optativas seleccionadas (
                        {selectedElectives.reduce((sum, e) => sum + e.credits, 0)} créditos)
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setSelectedElectives([])}>
                        Limpiar
                      </Button>
                      <Button onClick={handleAddSelectedElectives}>Agregar al Plan</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Electives Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.isArray(filteredElectives) &&
                filteredElectives.map((elective) => {
                  if (!elective) return null

                  const isAvailable = isElectiveAvailable(elective)
                  const isSelected = selectedElectives.some((e) => e.id === elective.id)

                  return (
                    <Card
                      key={elective.id}
                      className={`hover:shadow-md transition-shadow ${!isAvailable ? "opacity-60" : ""} ${
                        isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm line-clamp-1">{elective.code || ""}</h4>
                              <h5 className="text-sm text-gray-600 line-clamp-2 mb-1">{elective.name || ""}</h5>
                            </div>
                            <Badge variant="outline" className="ml-2">
                              {elective.credits || 0} créditos
                            </Badge>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-gray-600 line-clamp-2">{elective.description || ""}</p>

                          {/* Metadata */}
                          <div className="flex flex-wrap gap-2">
                            {elective.area && (
                              <Badge variant="secondary" className="text-xs">
                                {elective.area}
                              </Badge>
                            )}
                            {elective.difficulty && (
                              <Badge className={`text-xs ${getDifficultyColor(elective.difficulty)}`}>
                                {getDifficultyText(elective.difficulty)}
                              </Badge>
                            )}
                          </div>

                          {/* Stats */}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            {elective.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                <span>{elective.rating.toFixed(1)}</span>
                                {elective.reviews && <span>({elective.reviews})</span>}
                              </div>
                            )}
                            {elective.popularity && (
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 text-blue-400" />
                                <span>{elective.popularity}%</span>
                              </div>
                            )}
                          </div>

                          {/* Professor and Schedule */}
                          {(elective.professor || elective.schedule) && (
                            <div className="text-xs text-gray-500 space-y-1">
                              {elective.professor && (
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  <span>{elective.professor}</span>
                                </div>
                              )}
                              {elective.schedule && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{elective.schedule}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Prerequisites Warning */}
                          {!isAvailable && (
                            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                              Prerrequisitos no cumplidos
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 bg-transparent"
                                  onClick={() => setSelectedElective(elective)}
                                >
                                  Ver Detalles
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>{selectedElective?.name || ""}</DialogTitle>
                                  <DialogDescription>{selectedElective?.code || ""}</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <p className="text-sm text-gray-600">{selectedElective?.description || ""}</p>

                                  {selectedElective?.skills &&
                                    Array.isArray(selectedElective.skills) &&
                                    selectedElective.skills.length > 0 && (
                                      <div>
                                        <h4 className="font-medium text-sm mb-2">Habilidades que desarrollarás:</h4>
                                        <div className="flex flex-wrap gap-1">
                                          {selectedElective.skills.map((skill) => (
                                            <Badge key={skill} variant="outline" className="text-xs">
                                              {skill.replace(/_/g, " ")}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                  <div className="flex items-center gap-4">
                                    <Select
                                      value={selectedSemester.toString()}
                                      onValueChange={(value) => setSelectedSemester(Number.parseInt(value))}
                                    >
                                      <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Seleccionar semestre" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {Array.from({ length: maxYear * 2 }, (_, i) => i + 1).map((sem) => (
                                          <SelectItem key={sem} value={sem.toString()}>
                                            Semestre {sem}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      onClick={() =>
                                        selectedElective &&
                                        handleSelectElectiveForSemester(selectedElective, selectedSemester)
                                      }
                                      disabled={!isAvailable}
                                      className="flex items-center gap-1"
                                    >
                                      <Plus className="w-3 h-3" />
                                      Agregar al Plan
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            {isSelected ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemoveElective(elective.id)}
                                className="flex items-center gap-1 text-red-600 hover:text-red-700"
                              >
                                <Minus className="w-3 h-3" />
                                Quitar
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                disabled={!isAvailable}
                                onClick={() => handleAddElective(elective)}
                                className="flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                Agregar
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>

            {(!Array.isArray(filteredElectives) || filteredElectives.length === 0) && (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No se encontraron optativas médicas</h3>
                  <p className="text-sm text-gray-500">Intenta ajustar tus filtros de búsqueda</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <ElectiveRecommendations
              assignments={existingAssignments}
              completedAssignments={completedAssignments}
              availableElectives={availableElectives}
              career={career}
              maxYear={maxYear}
              onSelectElective={handleSelectElectiveForSemester}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
