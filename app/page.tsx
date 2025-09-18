"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Star,
  RotateCcw,
  CheckCircle2,
  Circle,
  Lock,
  Calendar,
  BarChart3,
  Languages,
  Download,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  TrendingUp,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/hooks/use-language"
import { ThemeToggle } from "@/app/components/theme-toggle"
import { GuestBanner } from "@/app/components/guest-banner"
import { ImportExport } from "@/app/components/import-export"
import { ElectivesManager } from "@/app/components/electives-manager"
import { AssignmentManager } from "@/app/components/assignment-manager"
import { AssignmentEditor } from "@/app/components/assignment-editor"
import { ExamPlanner } from "@/app/components/exam-planner"
import { defaultAssignments } from "@/app/data/default-assignments"

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
  orPrerequisites?: string[][] // Array of arrays for OR logic
  requiresAtLeastOne?: string[] // At least one of these must be completed
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

interface Exam {
  id: string
  assignmentId: string
  assignmentName: string
  assignmentCode?: string
  date: string
  time: string
  location: string
  type: "parcial" | "final" | "oral" | "practico"
  notes?: string
  completed: boolean
  grade?: number
  gradePercentile?: number
  attempt: number
}

export default function Home() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [customElectives, setCustomElectives] = useState<ElectiveOption[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [activeTab, setActiveTab] = useState("assignments")
  const [showAssignmentManager, setShowAssignmentManager] = useState(false)
  const [showAssignmentEditor, setShowAssignmentEditor] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const { language, setLanguage, t } = useLanguage()

  // Load assignments from localStorage or use defaults
  useEffect(() => {
    const savedAssignments = localStorage.getItem("assignments")
    if (savedAssignments) {
      try {
        const parsed = JSON.parse(savedAssignments)
        if (Array.isArray(parsed)) {
          setAssignments(parsed)
        } else {
          setAssignments(defaultAssignments)
        }
      } catch (error) {
        console.error("Error loading assignments:", error)
        setAssignments(defaultAssignments)
      }
    } else {
      setAssignments(defaultAssignments)
    }
  }, [])

  // Load custom electives from localStorage
  useEffect(() => {
    const savedCustomElectives = localStorage.getItem("custom-electives")
    if (savedCustomElectives) {
      try {
        setCustomElectives(JSON.parse(savedCustomElectives))
      } catch (error) {
        console.error("Error loading custom electives:", error)
      }
    }
  }, [])

  // Load exams from localStorage
  useEffect(() => {
    const savedExams = localStorage.getItem("medical-curriculum-exams")
    if (savedExams) {
      try {
        setExams(JSON.parse(savedExams))
      } catch (error) {
        console.error("Error loading exams:", error)
      }
    }
  }, [])

  // Save assignments to localStorage whenever they change
  useEffect(() => {
    if (assignments && assignments.length > 0) {
      localStorage.setItem("assignments", JSON.stringify(assignments))
    }
  }, [assignments])

  // Save custom electives to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("custom-electives", JSON.stringify(customElectives))
  }, [customElectives])

  const toggleAssignment = (id: string) => {
    setAssignments((prev) =>
      Array.isArray(prev)
        ? prev.map((assignment) =>
            assignment && assignment.id === id ? { ...assignment, completed: !assignment.completed } : assignment,
          )
        : [],
    )
  }

  const resetAll = () => {
    if (confirm(t("messages.confirmReset"))) {
      setAssignments((prev) =>
        Array.isArray(prev)
          ? prev.map((assignment) => (assignment ? { ...assignment, completed: false } : assignment))
          : [],
      )
    }
  }

  const completeAllAvailable = () => {
    const availableAssignments = getAvailableAssignments()
    setAssignments((prev) =>
      Array.isArray(prev)
        ? prev.map((assignment) =>
            assignment && availableAssignments.some((available) => available && available.id === assignment.id)
              ? { ...assignment, completed: true }
              : assignment,
          )
        : [],
    )
  }

  const checkOrPrerequisites = (orPrerequisites: string[][]) => {
    return orPrerequisites.some((orGroup) => {
      // Each OR group must have ALL its assignments completed (AND within the group)
      return orGroup.every((prereqId) => {
        const prereq = assignments.find((a) => a && a.id === prereqId)
        return prereq ? prereq.completed : false
      })
    })
  }

  const checkRequiresAtLeastOne = (requiresAtLeastOne: string[]) => {
    return requiresAtLeastOne.some((prereqId) => {
      const prereq = assignments.find((a) => a && a.id === prereqId)
      return prereq ? prereq.completed : false
    })
  }

  const getAvailableAssignments = () => {
    if (!assignments || !Array.isArray(assignments) || assignments.length === 0) return []

    return assignments.filter((assignment) => {
      if (!assignment || assignment.completed) return false

      // Check full year requirements
      if (assignment.requiresFullYear && assignment.requiresFullYear.length > 0) {
        const allRequiredYearsComplete = assignment.requiresFullYear.every((requiredYear) => {
          const yearAssignments = assignments.filter((a) => a && a.year === requiredYear && a.category === "core")
          return yearAssignments.length > 0 && yearAssignments.every((a) => a && a.completed)
        })
        if (!allRequiredYearsComplete) return false
      }

      // Check year lock - can't do year N+2 until year N is complete (only for core subjects)
      if (assignment.year > 1 && !assignment.requiresFullYear && assignment.category === "core") {
        const previousYearAssignments =
          assignments.filter((a) => a && a.year === assignment.year - 1 && a.category === "core") || []
        if (previousYearAssignments.length > 0) {
          const previousYearCompleted = previousYearAssignments.every((a) => a && a.completed)
          if (!previousYearCompleted) return false
        }
      }

      // Check OR prerequisites (if any) - these can reference assignments not yet selected
      if (assignment.orPrerequisites && assignment.orPrerequisites.length > 0) {
        if (!checkOrPrerequisites(assignment.orPrerequisites)) return false
      }

      // Check "at least one" requirements - these can reference assignments not yet selected
      if (assignment.requiresAtLeastOne && assignment.requiresAtLeastOne.length > 0) {
        if (!checkRequiresAtLeastOne(assignment.requiresAtLeastOne)) return false
      }

      // Check individual prerequisites
      if (assignment.prerequisites && Array.isArray(assignment.prerequisites) && assignment.prerequisites.length > 0) {
        const prerequisitesMet = assignment.prerequisites.every((prereqId) => {
          if (!prereqId) return true
          const prereq = assignments.find((a) => a && a.id === prereqId)
          return prereq ? prereq.completed : false
        })
        if (!prerequisitesMet) return false
      }

      return true
    })
  }

  const getAssignmentStatus = (assignment: Assignment) => {
    if (!assignment) return "prerequisiteLocked"
    if (assignment.completed) return "completed"

    // Check full year requirements
    if (assignment.requiresFullYear && assignment.requiresFullYear.length > 0) {
      const allRequiredYearsComplete = assignment.requiresFullYear.every((requiredYear) => {
        const yearAssignments = assignments.filter((a) => a && a.year === requiredYear && a.category === "core")
        return yearAssignments.length > 0 && yearAssignments.every((a) => a && a.completed)
      })
      if (!allRequiredYearsComplete) return "yearLocked"
    }

    // Check year lock (only for core subjects)
    if (assignment.year > 1 && !assignment.requiresFullYear && assignment.category === "core") {
      const previousYearAssignments =
        assignments.filter((a) => a && a.year === assignment.year - 1 && a.category === "core") || []
      if (previousYearAssignments.length > 0) {
        const previousYearCompleted = previousYearAssignments.every((a) => a && a.completed)
        if (!previousYearCompleted) return "yearLocked"
      }
    }

    // Check OR prerequisites
    if (assignment.orPrerequisites && assignment.orPrerequisites.length > 0) {
      if (!checkOrPrerequisites(assignment.orPrerequisites)) return "prerequisiteLocked"
    }

    // Check "at least one" requirements
    if (assignment.requiresAtLeastOne && assignment.requiresAtLeastOne.length > 0) {
      if (!checkRequiresAtLeastOne(assignment.requiresAtLeastOne)) return "prerequisiteLocked"
    }

    // Check individual prerequisites
    if (assignment.prerequisites && Array.isArray(assignment.prerequisites) && assignment.prerequisites.length > 0) {
      const prerequisitesMet = assignment.prerequisites.every((prereqId) => {
        if (!prereqId) return true
        const prereq = assignments.find((a) => a && a.id === prereqId)
        return prereq ? prereq.completed : false
      })
      if (!prerequisitesMet) return false
    }

    return "available"
  }

  const getStatusColor = (status: string, category: string) => {
    if (category === "elective") {
      switch (status) {
        case "completed":
          return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800"
        case "available":
          return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800"
        default:
          return "bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800"
      }
    }

    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800"
      case "available":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800"
      case "yearLocked":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800"
      case "prerequisiteLocked":
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-800"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-3 w-3" />
      case "available":
        return <Circle className="h-3 w-3" />
      case "yearLocked":
      case "prerequisiteLocked":
        return <Lock className="h-3 w-3" />
      default:
        return <Circle className="h-3 w-3" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "elective":
        return <Star className="h-3 w-3" />
      default:
        return <BookOpen className="h-3 w-3" />
    }
  }

  const getPrerequisiteNames = (assignment: Assignment) => {
    const prereqNames: string[] = []

    // Regular prerequisites
    if (assignment.prerequisites && assignment.prerequisites.length > 0) {
      assignment.prerequisites.forEach((prereqId) => {
        const prereq = assignments.find((a) => a && a.id === prereqId)
        if (prereq) {
          prereqNames.push(prereq.code || prereq.name)
        }
      })
    }

    // OR prerequisites - show even if assignments don't exist yet
    if (assignment.orPrerequisites && assignment.orPrerequisites.length > 0) {
      const orGroups = assignment.orPrerequisites
        .map((orGroup) => {
          const groupNames = orGroup
            .map((prereqId) => {
              const prereq = assignments.find((a) => a && a.id === prereqId)
              // Show the ID or a placeholder if assignment doesn't exist
              return prereq ? prereq.code || prereq.name : getAssignmentNameById(prereqId)
            })
            .filter(Boolean)
          return groupNames.length > 1 ? `(${groupNames.join(" + ")})` : groupNames[0]
        })
        .filter(Boolean)

      if (orGroups.length > 0) {
        prereqNames.push(`${orGroups.join(" o ")}`)
      }
    }

    // At least one requirements - show even if assignments don't exist yet
    if (assignment.requiresAtLeastOne && assignment.requiresAtLeastOne.length > 0) {
      const atLeastOneNames = assignment.requiresAtLeastOne
        .map((prereqId) => {
          const prereq = assignments.find((a) => a && a.id === prereqId)
          return prereq ? prereq.code || prereq.name : getAssignmentNameById(prereqId)
        })
        .filter(Boolean)

      if (atLeastOneNames.length > 0) {
        prereqNames.push(`Al menos uno: ${atLeastOneNames.join(", ")}`)
      }
    }

    return prereqNames
  }

  // Helper function to get assignment name by ID (for electives that might not be selected yet)
  const getAssignmentNameById = (id: string) => {
    const knownAssignments: Record<string, string> = {
      "m4pna-1755281573772-0": "M4PNA",
      "m4mc1-1755282300002-0": "M4MC1",
      "mpnal-1755282300003-0": "MPNAl",
      "m4bcp-1755281606088-0": "M4BCP",
      "bcp1-1755282300000-0": "BCP1",
      "bcp2-1755282300001-0": "BCP2",
    }
    return knownAssignments[id] || id.split("-")[0].toUpperCase()
  }

  const handleDeleteAssignment = (assignmentId: string) => {
    if (confirm(t("messages.confirmDelete"))) {
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId))
    }
  }

  const handleAddAssignment = (assignment: Assignment) => {
    if (editingAssignment) {
      // Update existing assignment
      setAssignments((prev) =>
        prev.map((a) => (a.id === editingAssignment.id ? { ...assignment, id: editingAssignment.id } : a)),
      )
    } else {
      // Add new assignment
      setAssignments((prev) => [...prev, assignment])
    }
  }

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment)
    setShowAssignmentEditor(true)
  }

  const handleUpdateAssignment = (updatedAssignment: Assignment) => {
    setAssignments((prev) => prev.map((a) => (a.id === updatedAssignment.id ? updatedAssignment : a)))
  }

  const handleAddElective = (elective: Assignment) => {
    setAssignments((prev) => [...prev, elective])
  }

  const handleRemoveElective = (electiveId: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== electiveId))
  }

  const handleUpdateCustomElectives = (electives: ElectiveOption[]) => {
    setCustomElectives(electives)
  }

  // Safe calculations with null checks
  const safeAssignments = Array.isArray(assignments) ? assignments.filter((a) => a) : []
  const completedAssignments = safeAssignments.filter((a) => a && a.completed)

  // Separate core and elective credits
  const coreAssignments = safeAssignments.filter((a) => a.category === "core")
  const electiveAssignments = safeAssignments.filter((a) => a.category === "elective")

  const completedCoreAssignments = coreAssignments.filter((a) => a.completed)
  const completedElectiveAssignments = electiveAssignments.filter((a) => a.completed)

  const totalCoreCredits = coreAssignments.reduce((sum, a) => sum + (a?.credits || 0), 0)
  const completedCoreCredits = completedCoreAssignments.reduce((sum, a) => sum + (a?.credits || 0), 0)

  const totalElectiveCredits = electiveAssignments.reduce((sum, a) => sum + (a?.credits || 0), 0)
  const completedElectiveCredits = completedElectiveAssignments.reduce((sum, a) => sum + (a?.credits || 0), 0)

  const totalCredits = totalCoreCredits + totalElectiveCredits
  const completedCredits = completedCoreCredits + completedElectiveCredits

  const availableAssignments = getAvailableAssignments()

  // Create a Set of completed assignment IDs for the exam planner
  const completedAssignmentIds = new Set(completedAssignments.map((a) => a.id))

  const assignmentsByYear = safeAssignments.reduce(
    (acc, assignment) => {
      if (!assignment) return acc
      if (!acc[assignment.year]) acc[assignment.year] = {}
      if (!acc[assignment.year][assignment.semester]) acc[assignment.year][assignment.semester] = []
      acc[assignment.year][assignment.semester].push(assignment)
      return acc
    },
    {} as Record<number, Record<number, Assignment[]>>,
  )

  const isYearCompleted = (year: number) => {
    const yearCoreAssignments = safeAssignments.filter((a) => a && a.year === year && a.category === "core")
    return yearCoreAssignments.length > 0 && yearCoreAssignments.every((a) => a && a.completed)
  }

  const handleImport = (data: any) => {
    if (data && typeof data === "object") {
      // Handle both old format (just assignments array) and new format (object with assignments and electives)
      if (Array.isArray(data)) {
        // Old format - just assignments
        const cleanedData = data.map((assignment) => ({
          id: assignment.id,
          name: assignment.name,
          code: assignment.code,
          credits: assignment.credits,
          year: assignment.year,
          semester: assignment.semester,
          category: assignment.category,
          prerequisites: assignment.prerequisites || [],
          completed: assignment.completed || false,
          instructor: assignment.instructor,
          schedule: assignment.schedule,
          location: assignment.location,
          requiresFullYear: assignment.requiresFullYear,
          orPrerequisites: assignment.orPrerequisites,
          requiresAtLeastOne: assignment.requiresAtLeastOne,
        }))
        setAssignments(cleanedData)
      } else {
        // New format - object with assignments and custom electives
        if (data.assignments && Array.isArray(data.assignments)) {
          const cleanedAssignments = data.assignments.map((assignment: any) => ({
            id: assignment.id,
            name: assignment.name,
            code: assignment.code,
            credits: assignment.credits,
            year: assignment.year,
            semester: assignment.semester,
            category: assignment.category,
            prerequisites: assignment.prerequisites || [],
            completed: assignment.completed || false,
            instructor: assignment.instructor,
            schedule: assignment.schedule,
            location: assignment.location,
            requiresFullYear: assignment.requiresFullYear,
            orPrerequisites: assignment.orPrerequisites,
            requiresAtLeastOne: assignment.requiresAtLeastOne,
          }))
          setAssignments(cleanedAssignments)
        }

        if (data.customElectives && Array.isArray(data.customElectives)) {
          const cleanedElectives = data.customElectives.map((elective: any) => ({
            id: elective.id,
            name: elective.name,
            code: elective.code,
            credits: elective.credits,
            dependencies: elective.dependencies || [],
            requiresFullYear: elective.requiresFullYear,
            description: elective.description,
            area: elective.area,
            skills: elective.skills || [],
            careerRelevance: elective.careerRelevance || {},
            difficulty: elective.difficulty || 5,
            popularity: elective.popularity || 50,
            professor: elective.professor,
            schedule: elective.schedule,
            rating: elective.rating || 0,
            reviews: elective.reviews || 0,
            availableYears: elective.availableYears || [4],
          }))
          setCustomElectives(cleanedElectives)
        }
      }
    }
  }

  const handleExport = () => {
    // Export both assignments and custom electives
    return {
      assignments: assignments.map((assignment) => ({
        id: assignment.id,
        name: assignment.name,
        code: assignment.code,
        credits: assignment.credits,
        year: assignment.year,
        semester: assignment.semester,
        category: assignment.category,
        prerequisites: assignment.prerequisites || [],
        completed: assignment.completed || false,
        instructor: assignment.instructor,
        schedule: assignment.schedule,
        location: assignment.location,
        requiresFullYear: assignment.requiresFullYear,
        orPrerequisites: assignment.orPrerequisites,
        requiresAtLeastOne: assignment.requiresAtLeastOne,
      })),
      customElectives: customElectives.map((elective) => ({
        id: elective.id,
        name: elective.name,
        code: elective.code,
        credits: elective.credits,
        dependencies: elective.dependencies || [],
        requiresFullYear: elective.requiresFullYear,
        description: elective.description,
        area: elective.area,
        skills: elective.skills || [],
        careerRelevance: elective.careerRelevance || {},
        difficulty: elective.difficulty || 5,
        popularity: elective.popularity || 50,
        professor: elective.professor,
        schedule: elective.schedule,
        rating: elective.rating || 0,
        reviews: elective.reviews || 0,
        availableYears: elective.availableYears || [4],
      })),
    }
  }

  // Calculate exam statistics for analytics
  const completedExams = exams.filter((exam) => exam.completed && exam.grade !== undefined)
  const averageGrade =
    completedExams.length > 0
      ? completedExams.reduce((sum, exam) => sum + (exam.grade || 0), 0) / completedExams.length
      : 0

  // Group exams by month for chart data
  const examsByMonth = completedExams.reduce(
    (acc, exam) => {
      const date = new Date(exam.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      if (!acc[monthKey]) {
        acc[monthKey] = []
      }
      acc[monthKey].push(exam)
      return acc
    },
    {} as Record<string, Exam[]>,
  )

  const chartData = Object.entries(examsByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6) // Last 6 months
    .map(([month, monthExams]) => ({
      month: new Date(month + "-01").toLocaleDateString("es", { month: "short", year: "numeric" }),
      promedio: monthExams.reduce((sum, exam) => sum + (exam.grade || 0), 0) / monthExams.length,
      examenes: monthExams.length,
    }))

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{t("assignments.title")}</h1>
            <p className="text-muted-foreground">{t("assignments.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setLanguage(language === "es" ? "en" : "es")}>
              <Languages className="h-4 w-4 mr-2" />
              {language === "es" ? "EN" : "ES"}
            </Button>
            <ThemeToggle />
          </div>
        </div>

        <GuestBanner />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {t("nav.assignments")}
            </TabsTrigger>
            <TabsTrigger value="planner" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t("nav.planner")}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t("nav.analytics")}
            </TabsTrigger>
            <TabsTrigger value="electives" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              {t("nav.electives")}
            </TabsTrigger>
            <TabsTrigger value="importExport" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              {t("nav.importExport")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-3">
                  <div className="text-xl font-bold">
                    {completedCoreCredits}/{totalCoreCredits}
                  </div>
                  <div className="text-xs text-muted-foreground">Créditos Básicos</div>
                  <Progress
                    value={totalCoreCredits > 0 ? (completedCoreCredits / totalCoreCredits) * 100 : 0}
                    className="mt-2 h-1"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="text-xl font-bold text-yellow-600">
                    {completedElectiveCredits}/{totalElectiveCredits}
                  </div>
                  <div className="text-xs text-muted-foreground">Créditos Optativas</div>
                  <Progress
                    value={totalElectiveCredits > 0 ? (completedElectiveCredits / totalElectiveCredits) * 100 : 0}
                    className="mt-2 h-1"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="text-xl font-bold text-green-600">{completedAssignments.length}</div>
                  <div className="text-xs text-muted-foreground">{t("stats.completedAssignments")}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="text-xl font-bold text-blue-600">{availableAssignments.length}</div>
                  <div className="text-xs text-muted-foreground">{t("stats.availableAssignments")}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="text-xl font-bold">{safeAssignments.length}</div>
                  <div className="text-xs text-muted-foreground">{t("stats.totalSubjects")}</div>
                </CardContent>
              </Card>
            </div>

            {/* Legend */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t("legend.title")}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span className="text-xs">{t("legend.completed")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Circle className="h-3 w-3 text-blue-600" />
                    <span className="text-xs">{t("legend.available")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="h-3 w-3 text-red-600" />
                    <span className="text-xs">{t("legend.yearLocked")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="h-3 w-3 text-gray-600" />
                    <span className="text-xs">{t("legend.prerequisiteLocked")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={() => setShowAssignmentManager(true)} size="sm">
                <Plus className="h-3 w-3 mr-2" />
                {t("actions.addAssignment")}
              </Button>
              <Button onClick={resetAll} variant="outline" size="sm">
                <RotateCcw className="h-3 w-3 mr-2" />
                {t("actions.resetAll")}
              </Button>
              <Button
                onClick={completeAllAvailable}
                variant="outline"
                size="sm"
                disabled={availableAssignments.length === 0}
              >
                <CheckCircle2 className="h-3 w-3 mr-2" />
                {t("actions.completeAvailable")}
              </Button>
            </div>

            {/* Assignments by Year */}
            <div className="space-y-6">
              {Object.entries(assignmentsByYear).map(([year, semesters]) => (
                <div key={year} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">{t(`year.${year}`)}</h2>
                    {isYearCompleted(Number.parseInt(year)) && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                        {t("messages.yearCompleted")}
                      </Badge>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(semesters).map(([semester, semesterAssignments]) => (
                      <div key={semester} className="space-y-2">
                        <h3 className="text-base font-semibold">{t(`semester.${semester}`)}</h3>
                        <div className="grid gap-1">
                          {Array.isArray(semesterAssignments) &&
                            semesterAssignments.map((assignment) => {
                              if (!assignment) return null
                              const status = getAssignmentStatus(assignment)
                              const prerequisiteNames = getPrerequisiteNames(assignment)

                              return (
                                <Card
                                  key={assignment.id}
                                  className={`cursor-pointer transition-all hover:shadow-sm ${getStatusColor(status, assignment.category)}`}
                                  onClick={() =>
                                    status === "available" || status === "completed"
                                      ? toggleAssignment(assignment.id)
                                      : null
                                  }
                                >
                                  <CardContent className="p-2">
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-start gap-2 flex-1 min-w-0">
                                        {getStatusIcon(status)}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-1 mb-1">
                                            {getCategoryIcon(assignment.category)}
                                            <div className="flex items-center gap-1 min-w-0">
                                              {assignment.code && (
                                                <Badge variant="outline" className="font-mono text-xs px-1 py-0">
                                                  {assignment.code}
                                                </Badge>
                                              )}
                                              <h4 className="font-medium text-xs truncate leading-tight">
                                                {assignment.name}
                                              </h4>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-1 text-xs opacity-75 mb-1">
                                            <Badge variant="outline" className="text-xs px-1 py-0">
                                              {assignment.credits} créditos
                                            </Badge>
                                            <Badge variant="outline" className="text-xs px-1 py-0">
                                              {t(`category.${assignment.category}`)}
                                            </Badge>
                                          </div>

                                          {/* Prerequisites Display */}
                                          <div className="text-xs text-gray-600 dark:text-gray-400">
                                            <strong>{t("prerequisites.title")}:</strong>
                                            {prerequisiteNames.length > 0 ? (
                                              <div className="flex flex-wrap gap-1 mt-1">
                                                {prerequisiteNames.map((prereqName, index) => (
                                                  <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                                                    {prereqName}
                                                  </Badge>
                                                ))}
                                              </div>
                                            ) : (
                                              <span className="text-gray-500 ml-1">{t("prerequisites.none")}</span>
                                            )}

                                            {assignment.requiresFullYear && assignment.requiresFullYear.length > 0 && (
                                              <div className="mt-1">
                                                <strong>{t("prerequisites.fullYear")}:</strong>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                  {assignment.requiresFullYear.map((year) => (
                                                    <Badge
                                                      key={year}
                                                      variant="destructive"
                                                      className="text-xs px-1 py-0"
                                                    >
                                                      {t(`year.${year}`)}
                                                    </Badge>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-5 w-5 p-0"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <MoreHorizontal className="h-3 w-3" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              handleEditAssignment(assignment)
                                            }}
                                          >
                                            <Edit className="h-3 w-3 mr-2" />
                                            {t("actions.editAssignment")}
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              handleDeleteAssignment(assignment.id)
                                            }}
                                            className="text-red-600"
                                          >
                                            <Trash2 className="h-3 w-3 mr-2" />
                                            {t("actions.deleteAssignment")}
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </CardContent>
                                </Card>
                              )
                            })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="planner" className="space-y-6">
            <ExamPlanner assignments={assignments} completedAssignments={completedAssignmentIds} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6">
              {/* General Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Progreso General</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progreso Total</span>
                        <span>{totalCredits > 0 ? Math.round((completedCredits / totalCredits) * 100) : 0}%</span>
                      </div>
                      <Progress value={totalCredits > 0 ? (completedCredits / totalCredits) * 100 : 0} />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mt-6">
                      {[1, 2, 3, 4, 5, 6, 7].map((year) => {
                        const yearAssignments = safeAssignments.filter((a) => a && a.year === year)
                        const yearCompleted = yearAssignments.filter((a) => a && a.completed)
                        const yearProgress =
                          yearAssignments.length > 0 ? (yearCompleted.length / yearAssignments.length) * 100 : 0

                        return (
                          <div key={year} className="text-center">
                            <div className="text-sm font-medium mb-2">{t(`year.${year}`)}</div>
                            <div className="text-2xl font-bold mb-1">{Math.round(yearProgress)}%</div>
                            <Progress value={yearProgress} className="h-2" />
                            <div className="text-xs text-muted-foreground mt-1">
                              {yearCompleted.length}/{yearAssignments.length}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Exam Performance */}
              {completedExams.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Rendimiento en Exámenes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{completedExams.length}</div>
                        <div className="text-sm text-muted-foreground">Exámenes Completados</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{averageGrade.toFixed(1)}</div>
                        <div className="text-sm text-muted-foreground">Promedio General</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {completedExams.length > 0
                            ? Math.round(
                                completedExams.reduce((sum, exam) => sum + (100 - (exam.gradePercentile || 0)), 0) /
                                  completedExams.length,
                              )
                            : 0}
                          %
                        </div>
                        <div className="text-sm text-muted-foreground">Percentil Promedio</div>
                      </div>
                    </div>

                    {/* Simple Grade Chart */}
                    {chartData.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-medium">Progreso por Mes</h4>
                        <div className="space-y-3">
                          {chartData.map((data, index) => (
                            <div key={index} className="flex items-center gap-4">
                              <div className="w-16 text-sm font-medium">{data.month}</div>
                              <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>{data.examenes} exámenes</span>
                                  <span className="font-medium">{data.promedio.toFixed(1)}/100</span>
                                </div>
                                <Progress value={data.promedio} className="h-2" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Grade Distribution */}
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Distribución de Calificaciones</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {[
                          {
                            range: "90-100",
                            color: "bg-green-500",
                            count: completedExams.filter((e) => (e.grade || 0) >= 90).length,
                          },
                          {
                            range: "80-89",
                            color: "bg-blue-500",
                            count: completedExams.filter((e) => (e.grade || 0) >= 80 && (e.grade || 0) < 90).length,
                          },
                          {
                            range: "70-79",
                            color: "bg-yellow-500",
                            count: completedExams.filter((e) => (e.grade || 0) >= 70 && (e.grade || 0) < 80).length,
                          },
                          {
                            range: "60-69",
                            color: "bg-orange-500",
                            count: completedExams.filter((e) => (e.grade || 0) >= 60 && (e.grade || 0) < 70).length,
                          },
                          {
                            range: "0-59",
                            color: "bg-red-500",
                            count: completedExams.filter((e) => (e.grade || 0) < 60).length,
                          },
                        ].map((grade) => (
                          <div key={grade.range} className="text-center">
                            <div className={`${grade.color} text-white rounded-md p-2 mb-1`}>
                              <div className="font-bold">{grade.count}</div>
                            </div>
                            <div className="text-xs text-muted-foreground">{grade.range}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="electives" className="space-y-6">
            <ElectivesManager
              assignments={assignments}
              onAddElective={handleAddElective}
              onRemoveElective={handleRemoveElective}
              customElectives={customElectives}
              onUpdateCustomElectives={handleUpdateCustomElectives}
            />
          </TabsContent>

          <TabsContent value="importExport" className="space-y-6">
            <ImportExport onImport={handleImport} onExport={handleExport} />
          </TabsContent>
        </Tabs>

        {/* Assignment Manager Dialog */}
        <AssignmentManager
          isOpen={showAssignmentManager}
          onClose={() => {
            setShowAssignmentManager(false)
            setEditingAssignment(null)
          }}
          onAddAssignment={handleAddAssignment}
          existingAssignments={assignments}
          editingAssignment={editingAssignment}
          maxYear={7}
        />

        {/* Assignment Editor Dialog */}
        <AssignmentEditor
          isOpen={showAssignmentEditor}
          onClose={() => {
            setShowAssignmentEditor(false)
            setEditingAssignment(null)
          }}
          onUpdateAssignment={handleUpdateAssignment}
          assignment={editingAssignment}
          existingAssignments={assignments}
          maxYear={7}
        />
      </div>
    </div>
  )
}
