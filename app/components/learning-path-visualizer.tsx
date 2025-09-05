"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { GitBranch, Target, CheckCircle, Circle, ArrowRight, BookOpen, Award, Clock } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

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

interface LearningMilestone {
  id: string
  name: string
  nameEs: string
  description: string
  descriptionEs: string
  requiredSkills: string[]
  yearTarget: number
  semesterTarget: number
  category: "foundation" | "intermediate" | "advanced" | "specialization"
  careerRelevance: {
    [key: string]: number
  }
}

interface LearningPathVisualizerProps {
  assignments: Assignment[]
  completedAssignments: Set<string>
  selectedCareerGoal: string | null
  maxYear: number
}

// Medical learning milestones
const getMedicalMilestones = (): LearningMilestone[] => [
  {
    id: "basic-sciences",
    name: "Basic Medical Sciences Foundation",
    nameEs: "Fundamentos de Ciencias Médicas Básicas",
    description: "Master fundamental medical sciences including anatomy, physiology, and biochemistry",
    descriptionEs: "Dominar las ciencias médicas fundamentales incluyendo anatomía, fisiología y bioquímica",
    requiredSkills: ["anatomy", "physiology", "biochemistry", "pathology"],
    yearTarget: 2,
    semesterTarget: 2,
    category: "foundation",
    careerRelevance: {
      internal_medicine: 100,
      surgeon: 100,
      pediatrician: 100,
      psychiatrist: 90,
      emergency_physician: 100,
      radiologist: 95,
      obgyn: 100,
      pathologist: 100,
      researcher: 95,
      public_health: 85,
      family_medicine: 100,
      anesthesiologist: 100,
    },
  },
  {
    id: "clinical-skills",
    name: "Clinical Skills Development",
    nameEs: "Desarrollo de Habilidades Clínicas",
    description: "Develop essential clinical examination and patient interaction skills",
    descriptionEs: "Desarrollar habilidades esenciales de examen clínico e interacción con pacientes",
    requiredSkills: ["clinical_examination", "patient_communication", "medical_history", "physical_diagnosis"],
    yearTarget: 3,
    semesterTarget: 1,
    category: "intermediate",
    careerRelevance: {
      internal_medicine: 100,
      surgeon: 95,
      pediatrician: 100,
      psychiatrist: 90,
      emergency_physician: 100,
      radiologist: 70,
      obgyn: 95,
      pathologist: 60,
      researcher: 70,
      public_health: 75,
      family_medicine: 100,
      anesthesiologist: 85,
    },
  },
  {
    id: "diagnostic-reasoning",
    name: "Diagnostic Reasoning Mastery",
    nameEs: "Dominio del Razonamiento Diagnóstico",
    description: "Master clinical reasoning and diagnostic decision-making processes",
    descriptionEs: "Dominar el razonamiento clínico y los procesos de toma de decisiones diagnósticas",
    requiredSkills: ["clinical_reasoning", "differential_diagnosis", "evidence_based_medicine", "critical_thinking"],
    yearTarget: 4,
    semesterTarget: 1,
    category: "advanced",
    careerRelevance: {
      internal_medicine: 100,
      surgeon: 90,
      pediatrician: 95,
      psychiatrist: 95,
      emergency_physician: 100,
      radiologist: 100,
      obgyn: 90,
      pathologist: 95,
      researcher: 85,
      public_health: 80,
      family_medicine: 100,
      anesthesiologist: 85,
    },
  },
  {
    id: "specialty-preparation",
    name: "Specialty Preparation",
    nameEs: "Preparación de Especialidad",
    description: "Prepare for specialized medical practice through focused electives and rotations",
    descriptionEs: "Prepararse para la práctica médica especializada a través de optativas y rotaciones enfocadas",
    requiredSkills: ["specialty_knowledge", "advanced_procedures", "research_skills", "leadership"],
    yearTarget: 5,
    semesterTarget: 2,
    category: "specialization",
    careerRelevance: {
      internal_medicine: 95,
      surgeon: 100,
      pediatrician: 95,
      psychiatrist: 95,
      emergency_physician: 95,
      radiologist: 100,
      obgyn: 100,
      pathologist: 100,
      researcher: 100,
      public_health: 90,
      family_medicine: 90,
      anesthesiologist: 100,
    },
  },
  {
    id: "clinical-rotations",
    name: "Clinical Rotations Excellence",
    nameEs: "Excelencia en Rotaciones Clínicas",
    description: "Excel in clinical rotations across multiple medical specialties",
    descriptionEs: "Sobresalir en rotaciones clínicas a través de múltiples especialidades médicas",
    requiredSkills: ["clinical_practice", "patient_management", "teamwork", "professionalism"],
    yearTarget: 6,
    semesterTarget: 1,
    category: "specialization",
    careerRelevance: {
      internal_medicine: 100,
      surgeon: 100,
      pediatrician: 100,
      psychiatrist: 95,
      emergency_physician: 100,
      radiologist: 90,
      obgyn: 100,
      pathologist: 85,
      researcher: 80,
      public_health: 85,
      family_medicine: 100,
      anesthesiologist: 95,
    },
  },
]

// Engineering learning milestones
const getEngineeringMilestones = (): LearningMilestone[] => [
  {
    id: "programming-fundamentals",
    name: "Programming Fundamentals",
    nameEs: "Fundamentos de Programación",
    description: "Master basic programming concepts and data structures",
    descriptionEs: "Dominar conceptos básicos de programación y estructuras de datos",
    requiredSkills: ["programming", "data_structures", "algorithms", "problem_solving"],
    yearTarget: 1,
    semesterTarget: 2,
    category: "foundation",
    careerRelevance: {
      software_engineer: 100,
      data_scientist: 95,
      product_manager: 70,
      researcher: 85,
    },
  },
  {
    id: "system-design",
    name: "System Design Proficiency",
    nameEs: "Competencia en Diseño de Sistemas",
    description: "Learn to design scalable and efficient software systems",
    descriptionEs: "Aprender a diseñar sistemas de software escalables y eficientes",
    requiredSkills: ["system_design", "architecture", "scalability", "databases"],
    yearTarget: 3,
    semesterTarget: 1,
    category: "intermediate",
    careerRelevance: {
      software_engineer: 100,
      data_scientist: 80,
      product_manager: 85,
      researcher: 70,
    },
  },
]

export function LearningPathVisualizer({
  assignments,
  completedAssignments,
  selectedCareerGoal,
  maxYear,
}: LearningPathVisualizerProps) {
  const { t, language } = useLanguage()
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null)

  // Get milestones based on career
  const getMilestones = () => {
    if (
      (selectedCareerGoal && selectedCareerGoal.includes("medicine")) ||
      selectedCareerGoal === "internal_medicine" ||
      selectedCareerGoal === "surgeon" ||
      selectedCareerGoal === "pediatrician"
    ) {
      return getMedicalMilestones()
    }
    return getEngineeringMilestones()
  }

  const milestones = getMilestones()

  // Calculate milestone progress
  const calculateMilestoneProgress = (milestone: LearningMilestone) => {
    const relevantAssignments = assignments.filter((assignment) => {
      // Simple heuristic: check if assignment relates to milestone skills
      const assignmentName = assignment.name.toLowerCase()
      const assignmentCode = assignment.code.toLowerCase()

      return milestone.requiredSkills.some((skill) => {
        const skillWords = skill.split("_")
        return skillWords.some((word) => assignmentName.includes(word) || assignmentCode.includes(word))
      })
    })

    const completedRelevant = relevantAssignments.filter((assignment) => completedAssignments.has(assignment.id)).length

    const totalRelevant = Math.max(relevantAssignments.length, 1)
    return Math.min(100, (completedRelevant / totalRelevant) * 100)
  }

  // Get milestone status
  const getMilestoneStatus = (milestone: LearningMilestone) => {
    const progress = calculateMilestoneProgress(milestone)
    const currentYear = Math.max(...assignments.filter((a) => completedAssignments.has(a.id)).map((a) => a.year), 1)
    const currentSemester = 1 // Simplified

    const isTimeReached =
      currentYear > milestone.yearTarget ||
      (currentYear === milestone.yearTarget && currentSemester >= milestone.semesterTarget)

    if (progress >= 80) return "completed"
    if (progress >= 40 || isTimeReached) return "in_progress"
    return "upcoming"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "in_progress":
        return <Circle className="w-5 h-5 text-blue-600 fill-blue-100" />
      default:
        return <Circle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-green-500 bg-green-50"
      case "in_progress":
        return "border-blue-500 bg-blue-50"
      default:
        return "border-gray-300 bg-gray-50"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "foundation":
        return <BookOpen className="w-4 h-4" />
      case "intermediate":
        return <Target className="w-4 h-4" />
      case "advanced":
        return <GitBranch className="w-4 h-4" />
      case "specialization":
        return <Award className="w-4 h-4" />
      default:
        return <Circle className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "foundation":
        return "text-blue-600 bg-blue-100"
      case "intermediate":
        return "text-green-600 bg-green-100"
      case "advanced":
        return "text-purple-600 bg-purple-100"
      case "specialization":
        return "text-orange-600 bg-orange-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  if (!selectedCareerGoal) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">{t("select_career_goal")}</h3>
          <p className="text-sm text-gray-500">
            {language === "es"
              ? "Selecciona un objetivo profesional para ver tu ruta de aprendizaje personalizada"
              : "Select a career goal to see your personalized learning path"}
          </p>
        </CardContent>
      </Card>
    )
  }

  const relevantMilestones = milestones
    .filter((milestone) => {
      const relevance = milestone.careerRelevance[selectedCareerGoal] || 0
      return relevance >= 70
    })
    .sort((a, b) => {
      if (a.yearTarget !== b.yearTarget) return a.yearTarget - b.yearTarget
      return a.semesterTarget - b.semesterTarget
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-purple-600" />
            {t("learning_path")}
          </CardTitle>
          <CardDescription>
            {language === "es"
              ? "Visualiza tu progreso hacia tu objetivo profesional a través de hitos de aprendizaje"
              : "Visualize your progress toward your career goal through learning milestones"}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Learning Path Timeline */}
      <div className="space-y-4">
        {relevantMilestones.map((milestone, index) => {
          const status = getMilestoneStatus(milestone)
          const progress = calculateMilestoneProgress(milestone)
          const isSelected = selectedMilestone === milestone.id

          return (
            <div key={milestone.id} className="relative">
              {/* Connection Line */}
              {index < relevantMilestones.length - 1 && (
                <div className="absolute left-6 top-16 w-0.5 h-8 bg-gray-300 z-0" />
              )}

              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${getStatusColor(status)} ${
                  isSelected ? "ring-2 ring-purple-500" : ""
                }`}
                onClick={() => setSelectedMilestone(isSelected ? null : milestone.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div className="flex-shrink-0 mt-1">{getStatusIcon(status)}</div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-sm">
                          {language === "es" ? milestone.nameEs : milestone.name}
                        </h4>
                        <Badge className={`text-xs ${getCategoryColor(milestone.category)}`}>
                          <div className="flex items-center gap-1">
                            {getCategoryIcon(milestone.category)}
                            {milestone.category}
                          </div>
                        </Badge>
                      </div>

                      <p className="text-xs text-gray-600 mb-3">
                        {language === "es" ? milestone.descriptionEs : milestone.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-700">
                            {language === "es" ? "Progreso" : "Progress"}
                          </span>
                          <span className="text-xs text-gray-600">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      {/* Timeline Info */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {language === "es" ? "Año" : "Year"} {milestone.yearTarget},{" "}
                            {language === "es" ? "Semestre" : "Semester"} {milestone.semesterTarget}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          <span>
                            {milestone.careerRelevance[selectedCareerGoal]}%{" "}
                            {language === "es" ? "relevancia" : "relevance"}
                          </span>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isSelected && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h5 className="text-xs font-medium text-gray-700 mb-2">
                            {language === "es" ? "Habilidades Requeridas:" : "Required Skills:"}
                          </h5>
                          <div className="flex flex-wrap gap-1">
                            {milestone.requiredSkills.map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill.replace(/_/g, " ")}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Arrow for expansion */}
                    <div className="flex-shrink-0">
                      <ArrowRight
                        className={`w-4 h-4 text-gray-400 transition-transform ${isSelected ? "rotate-90" : ""}`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {relevantMilestones.filter((m) => getMilestoneStatus(m) === "completed").length}
              </div>
              <div className="text-xs text-gray-600">{language === "es" ? "Completados" : "Completed"}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {relevantMilestones.filter((m) => getMilestoneStatus(m) === "in_progress").length}
              </div>
              <div className="text-xs text-gray-600">{language === "es" ? "En Progreso" : "In Progress"}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {relevantMilestones.filter((m) => getMilestoneStatus(m) === "upcoming").length}
              </div>
              <div className="text-xs text-gray-600">{language === "es" ? "Próximos" : "Upcoming"}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(
                  relevantMilestones.reduce((acc, m) => acc + calculateMilestoneProgress(m), 0) /
                    Math.max(relevantMilestones.length, 1),
                )}
                %
              </div>
              <div className="text-xs text-gray-600">{language === "es" ? "Progreso Total" : "Overall Progress"}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
