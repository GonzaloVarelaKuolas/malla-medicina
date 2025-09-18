"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Brain,
  TrendingUp,
  Users,
  Target,
  BookOpen,
  Star,
  Award,
  Clock,
  ChevronRight,
  Lightbulb,
  BarChart3,
} from "lucide-react"

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
  availableYears?: number[]
}

interface ElectiveRecommendationsProps {
  assignments: Assignment[]
  completedAssignments: Set<string>
  availableElectives: ElectiveOption[]
  selectedElectiveIds: Set<string>
  career: string | null
  maxYear: number
  onSelectElective: (elective: ElectiveOption, semester: number, selectedYear?: number) => void
}

// Career paths and their relevance to different medical specialties
const CAREER_PATHS = {
  internal_medicine: "Medicina Interna",
  surgery: "Cirugía",
  pediatrics: "Pediatría",
  psychiatry: "Psiquiatría",
  emergency_medicine: "Medicina de Emergencia",
  family_medicine: "Medicina Familiar",
  cardiology: "Cardiología",
  neurology: "Neurología",
  oncology: "Oncología",
  pathology: "Patología",
  radiology: "Radiología",
  anesthesiology: "Anestesiología",
  public_health: "Salud Pública",
  research: "Investigación Médica",
}

export default function ElectiveRecommendations({
  assignments = [],
  completedAssignments = new Set(),
  availableElectives = [],
  selectedElectiveIds = new Set(),
  career,
  maxYear,
  onSelectElective,
}: ElectiveRecommendationsProps) {
  const [selectedCareer, setSelectedCareer] = useState<string>(career || "internal_medicine")
  const [recommendationType, setRecommendationType] = useState<string>("career")

  // Safe filtering with null checks
  const completedCourses = useMemo(() => {
    if (!assignments || !completedAssignments) return []
    return assignments.filter((a) => a && completedAssignments.has(a.id))
  }, [assignments, completedAssignments])

  const availableElectiveOptions = useMemo(() => {
    if (!availableElectives) return []
    return availableElectives.filter((elective) => {
      if (!elective) return false

      // Check if already selected
      if (selectedElectiveIds.has(elective.id)) return false

      // Check prerequisites
      if (elective.dependencies && elective.dependencies.length > 0) {
        const prerequisitesMet = elective.dependencies.every((dep) => completedAssignments.has(dep))
        if (!prerequisitesMet) return false
      }

      // Check year requirements
      if (elective.requiresFullYear && elective.requiresFullYear.length > 0) {
        const yearRequirementsMet = elective.requiresFullYear.every((year) => {
          const yearAssignments = assignments.filter((a) => a && a.year === year && a.category === "core")
          return yearAssignments.length > 0 && yearAssignments.every((a) => completedAssignments.has(a.id))
        })
        if (!yearRequirementsMet) return false
      }

      return true
    })
  }, [availableElectives, selectedElectiveIds, completedAssignments, assignments])

  // AI-powered recommendations based on different criteria
  const recommendations = useMemo(() => {
    if (!availableElectiveOptions || availableElectiveOptions.length === 0) {
      return {
        career: [],
        trending: [],
        difficulty: [],
        comprehensive: [],
      }
    }

    // Career-based recommendations
    const careerRecommendations = availableElectiveOptions
      .filter((elective) => elective.careerRelevance && elective.careerRelevance[selectedCareer])
      .sort((a, b) => {
        const aRelevance = a.careerRelevance?.[selectedCareer] || 0
        const bRelevance = b.careerRelevance?.[selectedCareer] || 0
        return bRelevance - aRelevance
      })
      .slice(0, 6)

    // Trending/Popular recommendations
    const trendingRecommendations = availableElectiveOptions
      .filter((elective) => elective.popularity && elective.popularity > 60)
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 6)

    // Difficulty-based recommendations (balanced approach)
    const difficultyRecommendations = availableElectiveOptions
      .filter((elective) => elective.difficulty && elective.difficulty >= 4 && elective.difficulty <= 7)
      .sort((a, b) => {
        // Sort by rating first, then by balanced difficulty
        const aRating = a.rating || 0
        const bRating = b.rating || 0
        if (Math.abs(aRating - bRating) > 0.2) return bRating - aRating

        const aDiff = Math.abs((a.difficulty || 5) - 5.5) // Prefer moderate difficulty
        const bDiff = Math.abs((b.difficulty || 5) - 5.5)
        return aDiff - bDiff
      })
      .slice(0, 6)

    // Comprehensive recommendations (combines multiple factors)
    const comprehensiveRecommendations = availableElectiveOptions
      .map((elective) => {
        let score = 0

        // Career relevance (40% weight)
        if (elective.careerRelevance && elective.careerRelevance[selectedCareer]) {
          score += (elective.careerRelevance[selectedCareer] / 100) * 40
        }

        // Rating (25% weight)
        if (elective.rating) {
          score += (elective.rating / 5) * 25
        }

        // Popularity (20% weight)
        if (elective.popularity) {
          score += (elective.popularity / 100) * 20
        }

        // Balanced difficulty (15% weight)
        if (elective.difficulty) {
          const difficultyScore = 1 - Math.abs(elective.difficulty - 5.5) / 4.5
          score += difficultyScore * 15
        }

        return { ...elective, aiScore: score }
      })
      .sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0))
      .slice(0, 8)

    return {
      career: careerRecommendations,
      trending: trendingRecommendations,
      difficulty: difficultyRecommendations,
      comprehensive: comprehensiveRecommendations,
    }
  }, [availableElectiveOptions, selectedCareer])

  const getRecommendationTitle = (type: string) => {
    switch (type) {
      case "career":
        return `Recomendadas para ${CAREER_PATHS[selectedCareer as keyof typeof CAREER_PATHS] || "tu carrera"}`
      case "trending":
        return "Más Populares"
      case "difficulty":
        return "Dificultad Balanceada"
      case "comprehensive":
        return "Recomendaciones IA"
      default:
        return "Recomendaciones"
    }
  }

  const getRecommendationDescription = (type: string) => {
    switch (type) {
      case "career":
        return "Optativas altamente relevantes para tu especialidad médica elegida"
      case "trending":
        return "Las optativas más populares entre estudiantes de medicina"
      case "difficulty":
        return "Optativas con dificultad moderada y buenas calificaciones"
      case "comprehensive":
        return "Recomendaciones basadas en IA considerando múltiples factores"
      default:
        return ""
    }
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "career":
        return <Target className="w-5 h-5" />
      case "trending":
        return <TrendingUp className="w-5 h-5" />
      case "difficulty":
        return <BarChart3 className="w-5 h-5" />
      case "comprehensive":
        return <Brain className="w-5 h-5" />
      default:
        return <Lightbulb className="w-5 h-5" />
    }
  }

  const currentRecommendations = recommendations[recommendationType as keyof typeof recommendations] || []

  // Calculate completion statistics
  const totalElectives = availableElectives.length
  const selectedElectives = selectedElectiveIds.size
  const completionRate = totalElectives > 0 ? (selectedElectives / totalElectives) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                Recomendaciones Inteligentes de Optativas
              </CardTitle>
              <CardDescription>
                Sugerencias personalizadas basadas en tu progreso académico y objetivos profesionales
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">{selectedElectives}</div>
              <div className="text-sm text-muted-foreground">Optativas Seleccionadas</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progreso en Optativas</span>
                <span>{Math.round(completionRate)}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{availableElectiveOptions.length}</div>
              <div className="text-sm text-muted-foreground">Optativas Disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{completedCourses.length}</div>
              <div className="text-sm text-muted-foreground">Materias Completadas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Especialidad Médica de Interés</label>
              <Select value={selectedCareer} onValueChange={setSelectedCareer}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CAREER_PATHS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Recomendación</label>
              <Select value={recommendationType} onValueChange={setRecommendationType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">🧠 Recomendaciones IA</SelectItem>
                  <SelectItem value="career">🎯 Por Especialidad</SelectItem>
                  <SelectItem value="trending">📈 Más Populares</SelectItem>
                  <SelectItem value="difficulty">⚖️ Dificultad Balanceada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getRecommendationIcon(recommendationType)}
            {getRecommendationTitle(recommendationType)}
          </CardTitle>
          <CardDescription>{getRecommendationDescription(recommendationType)}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentRecommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentRecommendations.map((elective, index) => (
                <Card key={elective.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs font-mono">
                            {elective.code}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {elective.credits} créditos
                          </Badge>
                          {index < 3 && (
                            <Badge className="bg-purple-100 text-purple-800 text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              Top {index + 1}
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-semibold text-sm mb-2 line-clamp-2">{elective.name}</h4>
                      </div>
                    </div>

                    {elective.area && <Badge className="mb-2 text-xs bg-blue-100 text-blue-800">{elective.area}</Badge>}

                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{elective.description}</p>

                    {/* Recommendation Metrics */}
                    <div className="space-y-2 mb-3">
                      {recommendationType === "career" && elective.careerRelevance?.[selectedCareer] && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Relevancia para carrera:</span>
                          <div className="flex items-center gap-1">
                            <Progress value={elective.careerRelevance[selectedCareer]} className="w-16 h-1" />
                            <span className="font-medium">{elective.careerRelevance[selectedCareer]}%</span>
                          </div>
                        </div>
                      )}

                      {recommendationType === "comprehensive" && (elective as any).aiScore && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Puntuación IA:</span>
                          <div className="flex items-center gap-1">
                            <Progress value={(elective as any).aiScore} className="w-16 h-1" />
                            <span className="font-medium">{Math.round((elective as any).aiScore)}%</span>
                          </div>
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

                      {elective.difficulty && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Dificultad:</span>
                          <div className="flex items-center gap-1">
                            <div className="flex">
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                                <div
                                  key={level}
                                  className={`w-1 h-3 mx-px rounded-sm ${
                                    level <= (elective.difficulty || 0)
                                      ? level <= 3
                                        ? "bg-green-400"
                                        : level <= 7
                                          ? "bg-yellow-400"
                                          : "bg-red-400"
                                      : "bg-gray-200"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="font-medium ml-1">{elective.difficulty}/10</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Additional Info */}
                    <div className="space-y-1 mb-3">
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
                    </div>

                    {/* Available Years */}
                    {elective.availableYears && elective.availableYears.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-700 mb-1">Años disponibles:</p>
                        <div className="flex flex-wrap gap-1">
                          {elective.availableYears
                            .filter((year) => year > 0)
                            .map((year) => (
                              <Badge key={year} variant="outline" className="text-xs">
                                {year}°
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}

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

                    {/* Action Buttons */}
                    {elective.availableYears && elective.availableYears.length > 1 ? (
                      <div className="space-y-2">
                        <p className="text-xs font-medium">Seleccionar año:</p>
                        <div className="grid grid-cols-2 gap-1">
                          {elective.availableYears
                            .filter((year) => year > 0)
                            .map((year) => (
                              <div key={year} className="space-y-1">
                                <p className="text-xs text-center">{year}° Año</p>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    onClick={() => onSelectElective(elective, 1, year)}
                                    className="flex-1 text-xs py-1"
                                  >
                                    S1
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onSelectElective(elective, 2, year)}
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
                        <Button
                          size="sm"
                          onClick={() => onSelectElective(elective, 1)}
                          className="flex-1 flex items-center justify-center gap-1"
                        >
                          Agregar S1
                          <ChevronRight className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSelectElective(elective, 2)}
                          className="flex-1 flex items-center justify-center gap-1"
                        >
                          Agregar S2
                          <ChevronRight className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No hay recomendaciones disponibles</h3>
              <p className="text-sm text-gray-500">
                Completa más materias básicas para desbloquear recomendaciones de optativas
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights */}
      {completedCourses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              Insights Personalizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm">
                  <strong>Progreso Académico:</strong> Has completado {completedCourses.length} materias.
                  {completedCourses.length >= 20 && " ¡Excelente progreso! Ya puedes acceder a optativas avanzadas."}
                </p>
              </div>

              {selectedElectives > 0 && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm">
                    <strong>Optativas Seleccionadas:</strong> Has elegido {selectedElectives} optativas.
                    {selectedElectives >= 3
                      ? " Tu perfil académico está bien diversificado."
                      : " Considera agregar más optativas para ampliar tu formación."}
                  </p>
                </div>
              )}

              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm">
                  <strong>Recomendación IA:</strong> Basado en tu especialidad elegida (
                  {CAREER_PATHS[selectedCareer as keyof typeof CAREER_PATHS]}), te sugerimos enfocarte en optativas con
                  alta relevancia clínica y buenas calificaciones de estudiantes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
