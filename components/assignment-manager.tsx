"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, Circle, Lock, Edit, Trash2, GraduationCap } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

interface Assignment {
  id: string
  name: string
  credits: number
  year: number
  semester: number
  completed: boolean
  prerequisites?: string[]
  requiresFullYear?: number[]
}

interface AssignmentManagerProps {
  assignments?: Assignment[]
  onToggleComplete?: (id: string) => void
  onDeleteAssignment?: (id: string) => void
  editMode?: boolean
}

export function AssignmentManager({
  assignments = [],
  onToggleComplete = () => {},
  onDeleteAssignment = () => {},
  editMode = false,
}: AssignmentManagerProps) {
  const { t } = useLanguage()
  const [selectedYear, setSelectedYear] = useState<number>(1)

  // Verificaciones de seguridad para arrays
  const safeAssignments = Array.isArray(assignments) ? assignments : []

  const completedAssignments = safeAssignments.filter((a) => a?.completed === true)
  const totalCredits = safeAssignments.reduce((sum, a) => sum + (a?.credits || 0), 0)
  const completedCredits = completedAssignments.reduce((sum, a) => sum + (a?.credits || 0), 0)
  const progressPercentage = totalCredits > 0 ? (completedCredits / totalCredits) * 100 : 0

  const isAssignmentAvailable = (assignment: Assignment): boolean => {
    if (!assignment) return false

    // Si ya está completada, está disponible para desmarcar
    if (assignment.completed) return true

    // Verificar prerrequisitos individuales
    if (assignment.prerequisites && Array.isArray(assignment.prerequisites)) {
      const hasAllPrerequisites = assignment.prerequisites.every((prereqId) => {
        const prereq = safeAssignments.find((a) => a?.id === prereqId)
        return prereq?.completed === true
      })
      if (!hasAllPrerequisites) return false
    }

    // Verificar años completos requeridos
    if (assignment.requiresFullYear && Array.isArray(assignment.requiresFullYear)) {
      const hasRequiredYears = assignment.requiresFullYear.every((requiredYear) => {
        const yearAssignments = safeAssignments.filter((a) => a?.year === requiredYear)
        return yearAssignments.length > 0 && yearAssignments.every((a) => a?.completed === true)
      })
      if (!hasRequiredYears) return false
    }

    return true
  }

  const getAssignmentsByYear = (year: number) => {
    return safeAssignments.filter((a) => a?.year === year)
  }

  const getYearProgress = (year: number) => {
    const yearAssignments = getAssignmentsByYear(year)
    if (yearAssignments.length === 0) return 0

    const completedInYear = yearAssignments.filter((a) => a?.completed === true).length
    return (completedInYear / yearAssignments.length) * 100
  }

  const years = [1, 2, 3, 4, 5, 6]

  return (
    <div className="space-y-6">
      {/* Estadísticas generales */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("completedCredits")}</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedCredits}/{totalCredits}
            </div>
            <Progress value={progressPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("completedAssignments")}</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedAssignments.length}/{safeAssignments.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((completedAssignments.length / Math.max(safeAssignments.length, 1)) * 100)}% completado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("availableAssignments")}</CardTitle>
            <Circle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safeAssignments.filter((a) => !a?.completed && isAssignmentAvailable(a)).length}
            </div>
            <p className="text-xs text-muted-foreground">Materias que puedes cursar</p>
          </CardContent>
        </Card>
      </div>

      {/* Materias por año */}
      <Card>
        <CardHeader>
          <CardTitle>Materias por Año</CardTitle>
          <CardDescription>Organiza tu progreso académico por años de estudio</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number.parseInt(value))}>
            <TabsList className="grid w-full grid-cols-6">
              {years.map((year) => (
                <TabsTrigger key={year} value={year.toString()} className="relative">
                  {t(`year${year}`)}
                  <div className="absolute -top-1 -right-1">
                    <Badge variant="secondary" className="text-xs px-1">
                      {Math.round(getYearProgress(year))}%
                    </Badge>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {years.map((year) => (
              <TabsContent key={year} value={year.toString()} className="space-y-4">
                <div className="grid gap-3">
                  {getAssignmentsByYear(year).map((assignment) => {
                    if (!assignment) return null

                    const isAvailable = isAssignmentAvailable(assignment)
                    const isCompleted = assignment.completed

                    return (
                      <div
                        key={assignment.id}
                        className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                          isCompleted
                            ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                            : isAvailable
                              ? "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900"
                              : "bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onToggleComplete(assignment.id)}
                            disabled={!isAvailable}
                            className="p-0 h-auto"
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : isAvailable ? (
                              <Circle className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Lock className="h-5 w-5 text-gray-400" />
                            )}
                          </Button>

                          <div>
                            <h3 className="font-medium">{assignment.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">
                                {assignment.credits} {assignment.credits === 1 ? t("credit") : t("credits")}
                              </Badge>
                              <Badge variant="secondary">{t(`semester${assignment.semester}`)}</Badge>
                              {assignment.prerequisites && assignment.prerequisites.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {assignment.prerequisites.length} {t("prerequisites")}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {editMode && (
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteAssignment(assignment.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {getAssignmentsByYear(year).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay materias para {t(`year${year}`)}
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
