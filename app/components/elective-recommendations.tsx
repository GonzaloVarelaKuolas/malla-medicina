"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, TrendingUp, Users, Award, Target } from "lucide-react"

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
  availableElectives: ElectiveOption[]
  career: string
  maxYear: number
  onSelectElective: (elective: ElectiveOption, semester: number, selectedYear?: number) => void
}

export default function ElectiveRecommendations({
  assignments,
  completedAssignments,
  availableElectives,
  career,
  maxYear,
  onSelectElective,
}: ElectiveRecommendationsProps) {
  // Filter available electives that aren't already selected
  const unselectedElectives = availableElectives.filter((elective) => {
    return !assignments.some((a) => a.id === elective.id)
  })

  // AI-powered recommendations based on completed courses and career goals
  const getRecommendations = () => {
    const completedCourses = assignments.filter((a) => completedAssignments.has(a.id))
    const completedAreas = new Set(completedCourses.map((c) => c.category))

    // Score electives based on various factors
    const scoredElectives = unselectedElectives
      .map((elective) => {
        let score = 0

        // Career relevance (40% weight)
        if (elective.careerRelevance && career !== "all") {
          score += (elective.careerRelevance[career] || 0) * 0.4
        }

        // Popularity (20% weight)
        if (elective.popularity) {
          score += elective.popularity * 0.2
        }

        // Rating (20% weight)
        if (elective.rating) {
          score += (elective.rating / 5) * 100 * 0.2
        }

        // Prerequisites met bonus (10% weight)
        if (elective.dependencies && elective.dependencies.length > 0) {
          const metPrereqs = elective.dependencies.filter((dep) => completedAssignments.has(dep)).length
          score += (metPrereqs / elective.dependencies.length) * 100 * 0.1
        } else {
          score += 10 // Bonus for no prerequisites
        }

        // Difficulty adjustment (10% weight) - prefer moderate difficulty
        if (elective.difficulty) {
          const difficultyScore = 100 - Math.abs(elective.difficulty - 6) * 10
          score += difficultyScore * 0.1
        }

        return { ...elective, score }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6) // Top 6 recommendations

    return scoredElectives
  }

  const recommendations = getRecommendations()

  // Get trending electives (high popularity + recent additions)
  const trendingElectives = unselectedElectives
    .filter((e) => e.popularity && e.popularity > 70)
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 4)

  // Get highly rated electives
  const topRatedElectives = unselectedElectives
    .filter((e) => e.rating && e.rating >= 4.0 && e.reviews && e.reviews >= 10)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 4)

  return (
    <div className="space-y-6">
      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Recomendaciones Personalizadas IA
          </CardTitle>
          <CardDescription>
            Basadas en tu progreso académico, materias completadas y objetivos de carrera
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((elective) => (
                <Card key={elective.id} className="border-purple-200 bg-purple-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs font-mono">
                            {elective.code}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {elective.credits} créditos
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-sm mb-1">{elective.name}</h4>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-purple-600 font-medium">{Math.round(elective.score)}% match</div>
                        <Progress value={elective.score} className="w-16 h-1 mt-1" />
                      </div>
                    </div>

                    {elective.area && (
                      <Badge className="mb-2 text-xs bg-purple-100 text-purple-800">{elective.area}</Badge>
                    )}

                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{elective.description}</p>

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
                          career !== "all" &&
                          elective.careerRelevance[career] &&
                          elective.careerRelevance[career] > 70 && (
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
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No hay recomendaciones disponibles</h3>
              <p className="text-sm text-gray-500">
                Completa más materias básicas para recibir recomendaciones personalizadas
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trending Electives */}
      {trendingElectives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Optativas Populares
            </CardTitle>
            <CardDescription>Las optativas más elegidas por otros estudiantes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trendingElectives.map((elective) => (
                <Card key={elective.id} className="border-blue-200 bg-blue-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs font-mono">
                            {elective.code}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {elective.credits} créditos
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-sm mb-1">{elective.name}</h4>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        <Users className="w-2 h-2 mr-1" />
                        {elective.popularity}% popularidad
                      </Badge>
                    </div>

                    {elective.area && <Badge className="mb-2 text-xs bg-blue-100 text-blue-800">{elective.area}</Badge>}

                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{elective.description}</p>

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
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Rated Electives */}
      {topRatedElectives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              Mejor Calificadas
            </CardTitle>
            <CardDescription>Optativas con las mejores evaluaciones de estudiantes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topRatedElectives.map((elective) => (
                <Card key={elective.id} className="border-yellow-200 bg-yellow-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs font-mono">
                            {elective.code}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {elective.credits} créditos
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-sm mb-1">{elective.name}</h4>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                        <Award className="w-2 h-2 mr-1" />
                        {elective.rating?.toFixed(1)} ⭐
                      </Badge>
                    </div>

                    {elective.area && (
                      <Badge className="mb-2 text-xs bg-yellow-100 text-yellow-800">{elective.area}</Badge>
                    )}

                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{elective.description}</p>

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
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
