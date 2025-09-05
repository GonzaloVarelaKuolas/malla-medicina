"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, MapPin, User } from "lucide-react"
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
  instructor?: string
  schedule?: string
  location?: string
  requiresFullYear?: number[]
}

interface SemesterPlannerProps {
  assignments: Assignment[]
  selectedYear: number
  selectedSemester: number
}

export function SemesterPlanner({ assignments, selectedYear, selectedSemester }: SemesterPlannerProps) {
  const { t } = useLanguage()

  // Safe array handling with proper null checks
  const safeAssignments = Array.isArray(assignments) ? assignments.filter(Boolean) : []

  const semesterAssignments = safeAssignments.filter(
    (assignment) => assignment && assignment.year === selectedYear && assignment.semester === selectedSemester,
  )

  const completedAssignments = semesterAssignments.filter((assignment) => assignment && assignment.completed)
  const availableAssignments = semesterAssignments.filter((assignment) => assignment && !assignment.completed)
  const totalCredits = semesterAssignments.reduce((sum, assignment) => sum + (assignment?.credits || 0), 0)
  const completedCredits = completedAssignments.reduce((sum, assignment) => sum + (assignment?.credits || 0), 0)

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "core":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "elective":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "clinical":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "basic":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "internship":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getPrerequisiteNames = (prerequisites: string[]) => {
    if (!prerequisites || prerequisites.length === 0) return []

    return prerequisites
      .map((prereqId) => {
        const prereq = safeAssignments.find((a) => a.id === prereqId)
        if (prereq) {
          return prereq.code || prereq.name
        }
        return null
      })
      .filter(Boolean)
  }

  return (
    <div className="space-y-6">
      {/* Header with statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{semesterAssignments.length}</div>
            <div className="text-sm text-muted-foreground">Total de Materias</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{completedAssignments.length}</div>
            <div className="text-sm text-muted-foreground">Completadas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{availableAssignments.length}</div>
            <div className="text-sm text-muted-foreground">Pendientes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {completedCredits}/{totalCredits}
            </div>
            <div className="text-sm text-muted-foreground">Créditos</div>
          </CardContent>
        </Card>
      </div>

      {/* Assignment list */}
      <div className="grid gap-4">
        {semesterAssignments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">{t("messages.noSubjectsScheduled")}</h3>
              <p className="text-sm text-gray-500">{t("messages.noSubjectsFound")}</p>
            </CardContent>
          </Card>
        ) : (
          semesterAssignments.map((assignment) => {
            if (!assignment) return null

            const prerequisiteNames = getPrerequisiteNames(assignment.prerequisites)

            return (
              <Card key={assignment.id} className={`transition-all ${assignment.completed ? "opacity-75" : ""}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        {assignment.code && (
                          <Badge variant="outline" className="font-mono text-xs">
                            {assignment.code}
                          </Badge>
                        )}
                        <Badge className={getCategoryColor(assignment.category)}>
                          {t(`category.${assignment.category}`)}
                        </Badge>
                        <Badge variant="outline">{assignment.credits} créditos</Badge>
                        {assignment.completed && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Completada
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{assignment.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                    {assignment.instructor && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{assignment.instructor}</span>
                      </div>
                    )}
                    {assignment.schedule && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{assignment.schedule}</span>
                      </div>
                    )}
                    {assignment.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{assignment.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Prerequisites */}
                  <div className="border-t pt-3">
                    <div className="text-sm">
                      <strong className="text-gray-700 dark:text-gray-300">{t("prerequisites.title")}:</strong>
                      {prerequisiteNames.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {prerequisiteNames.map((prereqName, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {prereqName}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 ml-2">{t("prerequisites.none")}</span>
                      )}

                      {assignment.requiresFullYear && assignment.requiresFullYear.length > 0 && (
                        <div className="mt-2">
                          <strong className="text-gray-700 dark:text-gray-300">{t("prerequisites.fullYear")}:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {assignment.requiresFullYear.map((year) => (
                              <Badge key={year} variant="destructive" className="text-xs">
                                {t(`year.${year}`)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
