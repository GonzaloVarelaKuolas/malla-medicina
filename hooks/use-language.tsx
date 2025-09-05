"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type Language = "es" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  es: {
    // Navigation
    "nav.assignments": "Materias",
    "nav.planner": "Planificador",
    "nav.analytics": "Analíticas",
    "nav.electives": "Optativas",
    "nav.importExport": "Importar/Exportar",

    // Assignments
    "assignments.title": "Seguimiento de Materias Universitarias",
    "assignments.subtitle": "Gestiona tu progreso académico y planifica tu carrera",

    // Stats
    "stats.completedCredits": "Créditos Completados",
    "stats.completedAssignments": "Materias Completadas",
    "stats.availableAssignments": "Materias Disponibles",
    "stats.totalSubjects": "Total de Materias",

    // Legend
    "legend.title": "Leyenda",
    "legend.completed": "Completada",
    "legend.available": "Disponible",
    "legend.yearLocked": "Bloqueada por año",
    "legend.prerequisiteLocked": "Bloqueada por prerrequisitos",

    // Actions
    "actions.addAssignment": "Agregar Materia",
    "actions.resetAll": "Reiniciar Todo",
    "actions.completeAvailable": "Completar Disponibles",
    "actions.editAssignment": "Editar Materia",
    "actions.deleteAssignment": "Eliminar Materia",

    // Years
    "year.1": "Primer Año",
    "year.2": "Segundo Año",
    "year.3": "Tercer Año",
    "year.4": "Cuarto Año",
    "year.5": "Quinto Año",
    "year.6": "Sexto Año",
    "year.7": "Séptimo Año",

    // Semesters
    "semester.1": "Primer Semestre",
    "semester.2": "Segundo Semestre",

    // Categories
    "category.core": "Obligatoria",
    "category.elective": "Optativa",
    "category.clinical": "Clínica",
    "category.basic": "Básica",
    "category.internship": "Internado",

    // Prerequisites
    "prerequisites.title": "Prerrequisitos",
    "prerequisites.none": "Ninguno",
    "prerequisites.fullYear": "Años completos requeridos",

    // Messages
    "messages.confirmReset": "¿Estás seguro de que quieres reiniciar todo el progreso?",
    "messages.confirmDelete": "¿Estás seguro de que quieres eliminar esta materia?",
    "messages.yearCompleted": "Año Completado",
    "messages.noSubjectsScheduled": "No hay materias programadas",
    "messages.noSubjectsFound": "No se encontraron materias para este período",

    // Assignment Manager
    addNewAssignment: "Agregar Nueva Materia",
    createNewAssignment: "Crear una nueva materia con sus prerrequisitos",
    assignment: "Materia",
    assignmentName: "Nombre de la Materia",
    credits: "Créditos",
    year: "Año",
    semester: "Semestre",
    category: "Categoría",
    addAnotherAssignment: "Agregar Otra Materia",
    cancel: "Cancelar",
    addAssignments: "Agregar Materias",
    updateAssignment: "Actualizar Materia",
    editAssignment: "Editar Materia",
    editAssignmentDescription: "Modifica los detalles de la materia",
    currentLocation: "Ubicación Actual",
    individualDependencies: "Dependencias Individuales",
    selectSpecificAssignments: "Selecciona materias específicas requeridas",
    selectedRequirements: "Requisitos Seleccionados",

    // Exam Planner
    "examPlanner.title": "Planificador de Exámenes",
    "examPlanner.subtitle": "Programa tus exámenes para las materias disponibles",
    "examPlanner.scheduleExam": "Programar Examen",
    "examPlanner.selectSubject": "Seleccionar Materia",
    "examPlanner.examDate": "Fecha del Examen",
    "examPlanner.examTime": "Hora del Examen",
    "examPlanner.location": "Ubicación",
    "examPlanner.notes": "Notas",
    "examPlanner.upcomingExams": "Próximos Exámenes",
    "examPlanner.noExamsScheduled": "No hay exámenes programados",
    "examPlanner.scheduleFirstExam": "Programa tu primer examen usando el botón de arriba",
    "examPlanner.editExam": "Editar Examen",
    "examPlanner.deleteExam": "Eliminar Examen",
    "examPlanner.saveExam": "Guardar Examen",
    "examPlanner.updateExam": "Actualizar Examen",
    "examPlanner.pastDateWarning": "Fecha Anterior Detectada",
    "examPlanner.pastDateMessage": "La fecha seleccionada es anterior a hoy. ¿Ya completaste este examen?",
    "examPlanner.enterGrade": "Ingresar Calificación",
    "examPlanner.continueAnyway": "Continuar de Todas Formas",
    "examPlanner.gradePrompt": "Ingresa tu calificación para este examen completado",
    "examPlanner.attempt": "Intento",
  },
  en: {
    // Navigation
    "nav.assignments": "Assignments",
    "nav.planner": "Planner",
    "nav.analytics": "Analytics",
    "nav.electives": "Electives",
    "nav.importExport": "Import/Export",

    // Assignments
    "assignments.title": "University Course Tracker",
    "assignments.subtitle": "Manage your academic progress and plan your career",

    // Stats
    "stats.completedCredits": "Completed Credits",
    "stats.completedAssignments": "Completed Assignments",
    "stats.availableAssignments": "Available Assignments",
    "stats.totalSubjects": "Total Subjects",

    // Legend
    "legend.title": "Legend",
    "legend.completed": "Completed",
    "legend.available": "Available",
    "legend.yearLocked": "Year Locked",
    "legend.prerequisiteLocked": "Prerequisite Locked",

    // Actions
    "actions.addAssignment": "Add Assignment",
    "actions.resetAll": "Reset All",
    "actions.completeAvailable": "Complete Available",
    "actions.editAssignment": "Edit Assignment",
    "actions.deleteAssignment": "Delete Assignment",

    // Years
    "year.1": "First Year",
    "year.2": "Second Year",
    "year.3": "Third Year",
    "year.4": "Fourth Year",
    "year.5": "Fifth Year",
    "year.6": "Sixth Year",
    "year.7": "Seventh Year",

    // Semesters
    "semester.1": "First Semester",
    "semester.2": "Second Semester",

    // Categories
    "category.core": "Core",
    "category.elective": "Elective",
    "category.clinical": "Clinical",
    "category.basic": "Basic",
    "category.internship": "Internship",

    // Prerequisites
    "prerequisites.title": "Prerequisites",
    "prerequisites.none": "None",
    "prerequisites.fullYear": "Full years required",

    // Messages
    "messages.confirmReset": "Are you sure you want to reset all progress?",
    "messages.confirmDelete": "Are you sure you want to delete this assignment?",
    "messages.yearCompleted": "Year Completed",
    "messages.noSubjectsScheduled": "No subjects scheduled",
    "messages.noSubjectsFound": "No subjects found for this period",

    // Assignment Manager
    addNewAssignment: "Add New Assignment",
    createNewAssignment: "Create a new assignment with its prerequisites",
    assignment: "Assignment",
    assignmentName: "Assignment Name",
    credits: "Credits",
    year: "Year",
    semester: "Semester",
    category: "Category",
    addAnotherAssignment: "Add Another Assignment",
    cancel: "Cancel",
    addAssignments: "Add Assignments",
    updateAssignment: "Update Assignment",
    editAssignment: "Edit Assignment",
    editAssignmentDescription: "Modify the assignment details",
    currentLocation: "Current Location",
    individualDependencies: "Individual Dependencies",
    selectSpecificAssignments: "Select specific required assignments",
    selectedRequirements: "Selected Requirements",

    // Exam Planner
    "examPlanner.title": "Exam Planner",
    "examPlanner.subtitle": "Schedule your exams for available subjects",
    "examPlanner.scheduleExam": "Schedule Exam",
    "examPlanner.selectSubject": "Select Subject",
    "examPlanner.examDate": "Exam Date",
    "examPlanner.examTime": "Exam Time",
    "examPlanner.location": "Location",
    "examPlanner.notes": "Notes",
    "examPlanner.upcomingExams": "Upcoming Exams",
    "examPlanner.noExamsScheduled": "No exams scheduled",
    "examPlanner.scheduleFirstExam": "Schedule your first exam using the button above",
    "examPlanner.editExam": "Edit Exam",
    "examPlanner.deleteExam": "Delete Exam",
    "examPlanner.saveExam": "Save Exam",
    "examPlanner.updateExam": "Update Exam",
    "examPlanner.pastDateWarning": "Past Date Detected",
    "examPlanner.pastDateMessage": "The selected date is in the past. Have you already completed this exam?",
    "examPlanner.enterGrade": "Enter Grade",
    "examPlanner.continueAnyway": "Continue Anyway",
    "examPlanner.gradePrompt": "Enter your grade for this completed exam",
    "examPlanner.attempt": "Attempt",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("es")

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
