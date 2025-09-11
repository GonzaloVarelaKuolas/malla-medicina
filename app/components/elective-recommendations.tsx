"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain, TrendingUp, Award, Target, Check, Star } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

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
  rating?: number
  reviews?: number
  availableYears?: number[]
}

interface ElectiveRecommendationsProps {
  assignments: Assignment[]
  completedAssignments: Set<string>
  selectedElectiveIds: Set<string>
  availableElectives: ElectiveOption[]
  career: string
  maxYear: number
  onSelectElective: (elective: ElectiveOption, semester: number, selectedYear?: number) => void
}

const CAREER_OPTIONS = [
  { value: "internal_medicine", label: "Medicina Interna" },
  { value: "surgeon", label: "Cirugía" },
  { value: "pediatrician", label: "Pediatría" },
  { value: "psychiatrist", label: "Psiquiatría" },
  { value: "pathologist", label: "Patología" },
  { value: "radiologist", label: "Radiología" },
  { value: "anesthesiologist", label: "Anestesiología" },
  { value: "emergency_medicine", label: "Medicina de Emergencia" },
  { value: "family_medicine", label: "Medicina Familiar" },
  { value: "public_health", label: "Salud Pública" },
  { value: "researcher", label: "Investigación Médica" },
]

export default function ElectiveRecommendations({
  assignments,
  completedAssignments,
  selectedElectiveIds,
  availableElectives,
  career,
  maxYear,
  onSelectElective,
}: ElectiveRecommendationsProps) {
  const { t } = useLanguage()
  const [selectedCareer, setSelectedCareer] = useState<string>("internal_medicine")

  // Filter available electives (prerequisites met)
  const filteredElectives = availableElectives.filter((elective) => {
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

    return prerequisitesMet
  })

  // Get AI recommendations based on career choice
  const getRecommendations = () => {
    const careerRelevantElectives = filteredElectives
      .filter((elective) => elective.careerRelevance && elective.careerRelevance[selectedCareer])
      .sort((a, b) => {
        const aRelevance = a.careerRelevance?.[selectedCareer] || 0
        const bRelevance = b.careerRelevance?.[selectedCareer] || 0
        return bRelevance - aRelevance
      })
      .slice(0, 6) // Top 6 recommendations

    return careerRelevantElectives
  }

  const recommendations = getRecommendations()

  // Get completed courses for context
  const completedCourses = assignments.filter((a) => a.completed)
  const completedAreas = Array.from(new Set(completedCourses.map((c) => c.category)))

  return (
    <div className="space-y-6">
      {/* AI Career Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Recomendaciones Inteligentes
          </CardTitle>
          <CardDescription>
            Selecciona tu especialidad de interés para recibir recomendaciones personalizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Especialidad de Interés:</label>
              <Select value={selectedCareer} onValueChange={setSelectedCareer}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona una especialidad" />
                </SelectTrigger>
                <SelectContent>
                  {CAREER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <p className="font-medium mb-1">📊 Tu Progreso:</p>
              <p>✅ {completedCourses.length} materias completadas</p>
              <p>🎯 {recommendations.length} optativas recomendadas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      {recommendations.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">
              Recomendaciones para {CAREER_OPTIONS.find((c) => c.value === selectedCareer)?.label}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((elective, index) => {
              const relevanceScore = elective.careerRelevance?.[selectedCareer] || 0
              const isHighlyRecommended = relevanceScore >= 80
              const isSelected = selectedElectiveIds.has(elective.id)

              return (
                <Card
                  key={elective.id}
                  className={`hover:shadow-md transition-shadow ${
                    isHighlyRecommended ? "ring-2 ring-green-200 bg-green-50" : ""
                  } ${isSelected ? "ring-2 ring-yellow-400 bg-yellow-50/50" : ""}`}
                >
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
                          {isHighlyRecommended && (
                            <Badge className="text-xs bg-green-600">
                              <Star className="w-3 h-3 mr-1" />
                              Top
                            </Badge>
                          )}
                          {isSelected && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Check className="h-3 w-3 mr-1" />
                              Seleccionada
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-semibold text-sm mb-2 line-clamp-2">{elective.name}</h4>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-medium text-green-600">#{index + 1}</div>
                        <div className="text-xs text-gray-500">{relevanceScore}% match</div>
                      </div>
                    </div>

                    {elective.area && <Badge className="mb-2 text-xs bg-blue-100 text-blue-800">{elective.area}</Badge>}

                    <p className="text-xs text-gray-600 mb-3 line-clamp-3">{elective.description}</p>

                    {/* AI Reasoning */}
                    <div className="mb-3 p-2 bg-purple-50 rounded text-xs">
                      <p className="font-medium text-purple-800 mb-1">🤖 Por qué es recomendada:</p>
                      <p className="text-purple-700">
                        {relevanceScore >= 90 && "Altamente relevante para tu especialidad elegida"}
                        {relevanceScore >= 80 && relevanceScore < 90 && "Muy útil para tu carrera profesional"}
                        {relevanceScore >= 70 && relevanceScore < 80 && "Complementa bien tu formación"}
                        {relevanceScore < 70 && "Puede ser de interés según tu perfil"}
                      </p>
                    </div>

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

                    {/* Recommendation reasons */}
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {elective.careerRelevance &&
                          selectedCareer !== "all" &&
                          elective.careerRelevance[selectedCareer] &&
                          elective.careerRelevance[selectedCareer] > 70 && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                              <Target className="w-2 h-2 mr-1" />
                              Relevante para carrera
                            </Badge>
                          )}
                        {elective.popularity && elective.popularity > 80 && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            <TrendingUp className="w-2 h-2 mr-1" />
                            Popular
                          </Badge>
                        )}
                        {elective.rating && elective.rating >= 4.5 && (
                          <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                            <Award className="w-2 h-2 mr-1" />
                            Excelente rating
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Year Selection for Multi-Year Electives */}
                    {!isSelected && elective.availableYears && elective.availableYears.length > 1 ? (
                      <div className="space-y-2">
                        <p className="text-xs font-medium">Seleccionar año:</p>
                        <div className="grid grid-cols-2 gap-1">
                          {elective.availableYears.map((year) => (
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
                    ) : !isSelected ? (
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
                        Ya has seleccionado esta optativa
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No hay recomendaciones disponibles</h3>
            <p className="text-sm text-gray-500 mb-4">
              Completa más materias básicas para desbloquear recomendaciones personalizadas para{" "}
              {CAREER_OPTIONS.find((c) => c.value === selectedCareer)?.label}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
