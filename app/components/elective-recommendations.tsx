"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain,
  TrendingUp,
  Users,
  Target,
  Star,
  Award,
  Clock,
  ChevronRight,
  Lightbulb,
  BarChart3,
  Check,
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

// Career paths and their skill requirements
const CAREER_PATHS = {
  internal_medicine: {
    name: "Medicina Interna",
    skills: ["clinical_diagnosis", "patient_management", "internal_medicine", "chronic_care"],
    description: "Especialización en el diagnóstico y tratamiento de enfermedades internas",
  },
  surgery: {
    name: "Cirugía",
    skills: ["surgical_techniques", "anatomy", "emergency_care", "precision"],
    description: "Especialización en procedimientos quirúrgicos",
  },
  pediatrics: {
    name: "Pediatría",
    skills: ["child_development", "pediatric_care", "family_medicine", "vaccination"],
    description: "Especialización en el cuidado médico de niños y adolescentes",
  },
  cardiology: {
    name: "Cardiología",
    skills: ["cardiovascular_system", "cardiac_procedures", "emergency_care", "diagnostics"],
    description: "Especialización en enfermedades del corazón y sistema cardiovascular",
  },
  neurology: {
    name: "Neurología",
    skills: ["nervous_system", "neurological_disorders", "diagnostics", "rehabilitation"],
    description: "Especialización en enfermedades del sistema nervioso",
  },
  psychiatry: {
    name: "Psiquiatría",
    skills: ["mental_health", "psychology", "therapy", "behavioral_medicine"],
    description: "Especialización en salud mental y trastornos psiquiátricos",
  },
  emergency_medicine: {
    name: "Medicina de Emergencia",
    skills: ["emergency_care", "trauma", "critical_care", "rapid_diagnosis"],
    description: "Especialización en atención médica de emergencia",
  },
  family_medicine: {
    name: "Medicina Familiar",
    skills: ["primary_care", "community_health", "preventive_care", "family_medicine"],
    description: "Especialización en atención médica integral para familias",
  },
  pathology: {
    name: "Patología",
    skills: ["pathology", "laboratory_skills", "diagnostics", "research"],
    description: "Especialización en el diagnóstico de enfermedades mediante análisis de laboratorio",
  },
  radiology: {
    name: "Radiología",
    skills: ["medical_imaging", "diagnostics", "technology", "interpretation"],
    description: "Especialización en diagnóstico por imágenes médicas",
  },
}

export default function ElectiveRecommendations({
  assignments,
  completedAssignments,
  availableElectives,
  selectedElectiveIds,
  career,
  maxYear,
  onSelectElective,
}: ElectiveRecommendationsProps) {
  const [selectedCareer, setSelectedCareer] = useState<string>(career || "internal_medicine")
  const [recommendationType, setRecommendationType] = useState<string>("ai")

  // Calculate skill gaps based on completed assignments and selected career
  const skillGaps = useMemo(() => {
    const careerPath = CAREER_PATHS[selectedCareer as keyof typeof CAREER_PATHS]
    if (!careerPath) return []

    const completedSkills = new Set<string>()

    // Get skills from completed assignments
    assignments
      .filter((a) => completedAssignments.has(a.id))
      .forEach((assignment) => {
        // Find corresponding elective to get skills
        const elective = availableElectives.find((e) => e.id === assignment.id)
        if (elective && elective.skills) {
          elective.skills.forEach((skill) => completedSkills.add(skill))
        }
      })

    // Calculate gaps
    return careerPath.skills.map((skill) => ({
      skill,
      completed: completedSkills.has(skill),
      relevantElectives: availableElectives.filter(
        (e) => e.skills && e.skills.includes(skill) && !selectedElectiveIds.has(e.id),
      ),
    }))
  }, [selectedCareer, assignments, completedAssignments, availableElectives, selectedElectiveIds])

  // AI-powered recommendations based on career path and completed courses
  const aiRecommendations = useMemo(() => {
    const careerPath = CAREER_PATHS[selectedCareer as keyof typeof CAREER_PATHS]
    if (!careerPath) return []

    return availableElectives
      .filter((elective) => !selectedElectiveIds.has(elective.id))
      .map((elective) => {
        let score = 0
        const reasons: string[] = []

        // Career relevance score
        if (elective.careerRelevance && elective.careerRelevance[selectedCareer]) {
          score += elective.careerRelevance[selectedCareer] * 0.4
          reasons.push(`${elective.careerRelevance[selectedCareer]}% relevancia para ${careerPath.name}`)
        }

        // Skill alignment
        if (elective.skills) {
          const alignedSkills = elective.skills.filter((skill) => careerPath.skills.includes(skill))
          if (alignedSkills.length > 0) {
            score += (alignedSkills.length / careerPath.skills.length) * 30
            reasons.push(`Desarrolla ${alignedSkills.length} habilidades clave`)
          }
        }

        // Popularity and rating
        if (elective.popularity) {
          score += (elective.popularity / 100) * 15
        }
        if (elective.rating) {
          score += (elective.rating / 5) * 15
          reasons.push(`${elective.rating.toFixed(1)}⭐ calificación`)
        }

        // Difficulty balance (prefer moderate difficulty)
        if (elective.difficulty) {
          const difficultyScore = elective.difficulty <= 3 ? 10 : elective.difficulty <= 4 ? 5 : 0
          score += difficultyScore
        }

        return {
          elective,
          score: Math.round(score),
          reasons,
          confidence: score > 70 ? "Alta" : score > 50 ? "Media" : "Baja",
        }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
  }, [selectedCareer, availableElectives, selectedElectiveIds])

  // Popular electives based on ratings and reviews
  const popularRecommendations = useMemo(() => {
    return availableElectives
      .filter((elective) => !selectedElectiveIds.has(elective.id))
      .filter((elective) => elective.rating && elective.rating > 4.0)
      .sort((a, b) => {
        const scoreA = (a.rating || 0) * 0.6 + (a.popularity || 0) * 0.4
        const scoreB = (b.rating || 0) * 0.6 + (b.popularity || 0) * 0.4
        return scoreB - scoreA
      })
      .slice(0, 6)
  }, [availableElectives, selectedElectiveIds])

  // Trending electives based on popularity
  const trendingRecommendations = useMemo(() => {
    return availableElectives
      .filter((elective) => !selectedElectiveIds.has(elective.id))
      .filter((elective) => elective.popularity && elective.popularity > 60)
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 6)
  }, [availableElectives, selectedElectiveIds])

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "Alta":
        return "text-green-600 bg-green-100"
      case "Media":
        return "text-yellow-600 bg-yellow-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Recomendaciones Inteligentes de Optativas
          </CardTitle>
          <CardDescription>
            Recomendaciones personalizadas basadas en tu carrera objetivo y progreso académico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Especialidad Objetivo</label>
              <Select value={selectedCareer} onValueChange={setSelectedCareer}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CAREER_PATHS).map(([key, path]) => (
                    <SelectItem key={key} value={key}>
                      {path.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={recommendationType} onValueChange={setRecommendationType} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            IA Personalizada
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Por Habilidades
          </TabsTrigger>
          <TabsTrigger value="popular" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Más Populares
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Tendencias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Recomendaciones IA para {CAREER_PATHS[selectedCareer as keyof typeof CAREER_PATHS]?.name}
              </CardTitle>
              <CardDescription>
                {CAREER_PATHS[selectedCareer as keyof typeof CAREER_PATHS]?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiRecommendations.map((recommendation, index) => {
                  const { elective, score, reasons, confidence } = recommendation
                  const isSelected = selectedElectiveIds.has(elective.id)

                  return (
                    <Card
                      key={elective.id}
                      className={`hover:shadow-md transition-shadow ${
                        isSelected ? "ring-2 ring-yellow-400 bg-yellow-50/50" : ""
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs font-mono">
                                {elective.code}
                              </Badge>
                              <Badge className={`text-xs ${getConfidenceColor(confidence)}`}>
                                {confidence} confianza
                              </Badge>
                              {isSelected && (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  <Check className="h-3 w-3 mr-1" />
                                  Seleccionada
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-semibold text-sm mb-2 line-clamp-2">{elective.name}</h4>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="text-xs">
                                {elective.credits} créditos
                              </Badge>
                              <div className="flex items-center gap-1">
                                <BarChart3 className="w-3 h-3 text-purple-500" />
                                <span className="text-xs font-medium">{score}% match</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-purple-600">#{index + 1}</div>
                          </div>
                        </div>

                        {elective.area && (
                          <Badge className="mb-2 text-xs bg-blue-100 text-blue-800">{elective.area}</Badge>
                        )}

                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{elective.description}</p>

                        {/* AI Reasoning */}
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-700 mb-1">¿Por qué recomendamos esta optativa?</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {reasons.slice(0, 2).map((reason, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <ChevronRight className="w-3 h-3 mt-0.5 text-purple-500 flex-shrink-0" />
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Additional Info */}
                        <div className="space-y-1 mb-3 text-xs text-gray-600">
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
                          {elective.rating && elective.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              <span>
                                {elective.rating.toFixed(1)} ⭐ ({elective.reviews} reseñas)
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        {!isSelected ? (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => onSelectElective(elective, 1)} className="flex-1">
                              Agregar S1
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onSelectElective(elective, 2)}
                              className="flex-1"
                            >
                              Agregar S2
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center py-2 text-sm text-yellow-700 bg-yellow-50 rounded-md">
                            Ya seleccionada
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {aiRecommendations.length === 0 && (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No hay recomendaciones disponibles</h3>
                  <p className="text-sm text-gray-500">
                    Completa más materias básicas para obtener recomendaciones personalizadas
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Desarrollo de Habilidades para {CAREER_PATHS[selectedCareer as keyof typeof CAREER_PATHS]?.name}
              </CardTitle>
              <CardDescription>Optativas organizadas por las habilidades que necesitas desarrollar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {skillGaps.map((gap, index) => (
                  <div key={gap.skill} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium capitalize">{gap.skill.replace(/_/g, " ")}</h4>
                        {gap.completed && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            <Check className="w-3 h-3 mr-1" />
                            Completada
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {gap.relevantElectives.length} optativas disponibles
                      </Badge>
                    </div>

                    {gap.relevantElectives.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {gap.relevantElectives.slice(0, 3).map((elective) => {
                          const isSelected = selectedElectiveIds.has(elective.id)

                          return (
                            <Card
                              key={elective.id}
                              className={`hover:shadow-sm transition-shadow ${
                                isSelected ? "ring-2 ring-yellow-400 bg-yellow-50/50" : ""
                              }`}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="text-xs font-mono">
                                    {elective.code}
                                  </Badge>
                                  {isSelected && (
                                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                      <Check className="h-3 w-3 mr-1" />
                                      Seleccionada
                                    </Badge>
                                  )}
                                </div>
                                <h5 className="font-medium text-sm mb-2 line-clamp-2">{elective.name}</h5>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {elective.credits} créditos
                                  </Badge>
                                  {elective.rating && (
                                    <span className="text-xs text-gray-600">{elective.rating.toFixed(1)} ⭐</span>
                                  )}
                                </div>

                                {!isSelected ? (
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      onClick={() => onSelectElective(elective, 1)}
                                      className="flex-1 text-xs py-1"
                                    >
                                      S1
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => onSelectElective(elective, 2)}
                                      className="flex-1 text-xs py-1"
                                    >
                                      S2
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="text-center py-1 text-xs text-yellow-700 bg-yellow-50 rounded">
                                    Seleccionada
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    )}

                    {gap.relevantElectives.length === 0 && (
                      <p className="text-sm text-gray-500 italic">
                        No hay optativas disponibles para desarrollar esta habilidad
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popular" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Optativas Más Populares
              </CardTitle>
              <CardDescription>Las optativas mejor calificadas por otros estudiantes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularRecommendations.map((elective) => {
                  const isSelected = selectedElectiveIds.has(elective.id)

                  return (
                    <Card
                      key={elective.id}
                      className={`hover:shadow-md transition-shadow ${
                        isSelected ? "ring-2 ring-yellow-400 bg-yellow-50/50" : ""
                      }`}
                    >
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
                              {isSelected && (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  <Check className="h-3 w-3 mr-1" />
                                  Seleccionada
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-semibold text-sm mb-2 line-clamp-2">{elective.name}</h4>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-medium">{elective.rating?.toFixed(1)}</span>
                          </div>
                        </div>

                        {elective.area && (
                          <Badge className="mb-2 text-xs bg-blue-100 text-blue-800">{elective.area}</Badge>
                        )}

                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{elective.description}</p>

                        <div className="space-y-1 mb-3 text-xs text-gray-600">
                          {elective.professor && (
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{elective.professor}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            <span>
                              {elective.reviews} reseñas • {elective.popularity}% popularidad
                            </span>
                          </div>
                        </div>

                        {!isSelected ? (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => onSelectElective(elective, 1)} className="flex-1">
                              Agregar S1
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onSelectElective(elective, 2)}
                              className="flex-1"
                            >
                              Agregar S2
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center py-2 text-sm text-yellow-700 bg-yellow-50 rounded-md">
                            Ya seleccionada
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {popularRecommendations.length === 0 && (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No hay optativas populares disponibles</h3>
                  <p className="text-sm text-gray-500">
                    Completa más materias básicas para desbloquear optativas populares
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Optativas en Tendencia
              </CardTitle>
              <CardDescription>Las optativas más demandadas actualmente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingRecommendations.map((elective) => {
                  const isSelected = selectedElectiveIds.has(elective.id)

                  return (
                    <Card
                      key={elective.id}
                      className={`hover:shadow-md transition-shadow ${
                        isSelected ? "ring-2 ring-yellow-400 bg-yellow-50/50" : ""
                      }`}
                    >
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
                              {isSelected && (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  <Check className="h-3 w-3 mr-1" />
                                  Seleccionada
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-semibold text-sm mb-2 line-clamp-2">{elective.name}</h4>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium">{elective.popularity}%</span>
                          </div>
                        </div>

                        {elective.area && (
                          <Badge className="mb-2 text-xs bg-blue-100 text-blue-800">{elective.area}</Badge>
                        )}

                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{elective.description}</p>

                        <div className="space-y-1 mb-3 text-xs text-gray-600">
                          {elective.professor && (
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{elective.professor}</span>
                            </div>
                          )}
                          {elective.rating && (
                            <div className="flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              <span>
                                {elective.rating.toFixed(1)} ⭐ ({elective.reviews} reseñas)
                              </span>
                            </div>
                          )}
                        </div>

                        {!isSelected ? (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => onSelectElective(elective, 1)} className="flex-1">
                              Agregar S1
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onSelectElective(elective, 2)}
                              className="flex-1"
                            >
                              Agregar S2
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center py-2 text-sm text-yellow-700 bg-yellow-50 rounded-md">
                            Ya seleccionada
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {trendingRecommendations.length === 0 && (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No hay optativas en tendencia disponibles</h3>
                  <p className="text-sm text-gray-500">
                    Completa más materias básicas para desbloquear optativas en tendencia
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
