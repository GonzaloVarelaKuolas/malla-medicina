"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Plus, Clock, MapPin, Edit, Trash2, AlertTriangle, Star, CheckCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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

interface ExamPlannerProps {
  assignments: Assignment[]
  completedAssignments: Set<string>
  onExamsChange?: (exams: Exam[]) => void
}

export function ExamPlanner({ assignments, completedAssignments, onExamsChange }: ExamPlannerProps) {
  const [exams, setExams] = useState<Exam[]>([])
  const [showAddExamDialog, setShowAddExamDialog] = useState(false)
  const [showPastDateDialog, setShowPastDateDialog] = useState(false)
  const [showGradeDialog, setShowGradeDialog] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [pendingExam, setPendingExam] = useState<Partial<Exam> | null>(null)
  const [newExam, setNewExam] = useState({
    assignmentId: "",
    date: "",
    time: "",
    location: "",
    type: "parcial" as const,
    notes: "",
    grade: "",
  })

  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
  const [completingExam, setCompletingExam] = useState<Exam | null>(null)

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

  // Save exams to localStorage and call callback
  useEffect(() => {
    localStorage.setItem("medical-curriculum-exams", JSON.stringify(exams))
    onExamsChange?.(exams)
  }, [exams, onExamsChange])

  const calculatePercentile = (grade: number) => {
    // Simple percentile calculation based on grade
    if (grade >= 95) return 95
    if (grade >= 90) return 85
    if (grade >= 85) return 75
    if (grade >= 80) return 65
    if (grade >= 75) return 55
    if (grade >= 70) return 45
    if (grade >= 65) return 35
    if (grade >= 60) return 25
    return 15
  }

  const isPastDate = (dateString: string) => {
    const examDate = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return examDate < today
  }

  const handleSubmitExam = () => {
    const selectedAssignment = assignments.find((a) => a.id === newExam.assignmentId)
    if (!selectedAssignment) return

    const examDate = newExam.date
    const isPast = isPastDate(examDate)

    // Get existing attempts for this assignment
    const existingAttempts = exams.filter((e) => e.assignmentId === newExam.assignmentId)
    const attemptNumber = existingAttempts.length + 1

    const examData: Partial<Exam> = {
      id: editingExam?.id || `exam-${Date.now()}`,
      assignmentId: newExam.assignmentId,
      assignmentName: selectedAssignment.name,
      assignmentCode: selectedAssignment.code,
      date: examDate,
      time: newExam.time,
      location: newExam.location,
      type: newExam.type,
      notes: newExam.notes,
      completed: false,
      attempt: editingExam?.attempt || attemptNumber,
    }

    if (isPast && !editingExam) {
      // Show past date warning for new exams
      setPendingExam(examData)
      setShowPastDateDialog(true)
      return
    }

    // Add or update exam
    if (editingExam) {
      setExams((prev) => prev.map((e) => (e.id === editingExam.id ? ({ ...e, ...examData } as Exam) : e)))
    } else {
      setExams((prev) => [...prev, examData as Exam])
    }

    resetForm()
  }

  const handlePastDateConfirm = () => {
    if (!pendingExam) return

    setShowPastDateDialog(false)

    // Add the exam and immediately ask for grade
    const newExamWithId = { ...pendingExam } as Exam
    setExams((prev) => [...prev, newExamWithId])

    // Show grade input dialog
    setEditingExam(newExamWithId)
    setNewExam({ ...newExam, grade: "" })
    setShowGradeDialog(true)

    setPendingExam(null)
  }

  const handleGradeSubmit = () => {
    if (!editingExam || !newExam.grade) return

    const grade = Number.parseFloat(newExam.grade)
    const percentile = calculatePercentile(grade)

    setExams((prev) =>
      prev.map((e) =>
        e.id === editingExam.id
          ? {
              ...e,
              completed: true,
              grade: grade,
              gradePercentile: percentile,
            }
          : e,
      ),
    )

    setShowGradeDialog(false)
    resetForm()
  }

  const handleCompleteExam = (exam: Exam) => {
    setCompletingExam(exam)
    setShowCompletionDialog(true)
  }

  const handleSubmitCompletion = () => {
    if (!completingExam) return

    const grade = newExam.grade ? Number.parseFloat(newExam.grade) : undefined
    const percentile = grade ? calculatePercentile(grade) : undefined

    setExams((prev) =>
      prev.map((e) => (e.id === completingExam.id ? { ...e, completed: true, grade, gradePercentile: percentile } : e)),
    )

    setShowCompletionDialog(false)
    setCompletingExam(null)
    setNewExam({ ...newExam, grade: "" })
  }

  const resetForm = () => {
    setNewExam({
      assignmentId: "",
      date: "",
      time: "",
      location: "",
      type: "parcial",
      notes: "",
      grade: "",
    })
    setShowAddExamDialog(false)
    setEditingExam(null)
    setPendingExam(null)
  }

  const handleEditExam = (exam: Exam) => {
    setEditingExam(exam)
    setNewExam({
      assignmentId: exam.assignmentId,
      date: exam.date,
      time: exam.time,
      location: exam.location,
      type: exam.type,
      notes: exam.notes || "",
      grade: exam.grade?.toString() || "",
    })
    setShowAddExamDialog(true)
  }

  const handleDeleteExam = (examId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este examen?")) {
      setExams((prev) => prev.filter((e) => e.id !== examId))
    }
  }

  const handleAddGrade = (exam: Exam) => {
    setEditingExam(exam)
    setNewExam({ ...newExam, grade: exam.grade?.toString() || "" })
    setShowGradeDialog(true)
  }

  // Group exams by date
  const examsByDate = exams.reduce(
    (acc, exam) => {
      const date = exam.date
      if (!acc[date]) acc[date] = []
      acc[date].push(exam)
      return acc
    },
    {} as Record<string, Exam[]>,
  )

  const sortedDates = Object.keys(examsByDate).sort()

  const getExamTypeColor = (type: string) => {
    switch (type) {
      case "parcial":
        return "bg-blue-100 text-blue-800"
      case "final":
        return "bg-red-100 text-red-800"
      case "oral":
        return "bg-green-100 text-green-800"
      case "practico":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getGradeColor = (grade?: number) => {
    if (!grade) return "text-gray-500"
    if (grade >= 90) return "text-green-600"
    if (grade >= 80) return "text-blue-600"
    if (grade >= 70) return "text-yellow-600"
    if (grade >= 60) return "text-orange-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Planificador de Exámenes
          </CardTitle>
          <CardDescription>Organiza y rastrea tus exámenes y calificaciones</CardDescription>
        </CardHeader>
      </Card>

      {/* Add Exam Button */}
      <Button onClick={() => setShowAddExamDialog(true)} className="w-full md:w-auto">
        <Plus className="w-4 h-4 mr-2" />
        Agregar Examen
      </Button>

      {/* Exams Timeline */}
      <div className="space-y-4">
        {sortedDates.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No hay exámenes programados</h3>
              <p className="text-sm text-gray-500">Agrega tu primer examen para comenzar a organizar tu calendario</p>
            </CardContent>
          </Card>
        ) : (
          sortedDates.map((date) => (
            <Card key={date}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {new Date(date).toLocaleDateString("es", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {examsByDate[date].map((exam) => (
                    <div key={exam.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center gap-2">
                          {exam.assignmentCode && (
                            <Badge variant="outline" className="font-mono text-xs">
                              {exam.assignmentCode}
                            </Badge>
                          )}
                          <Badge className={getExamTypeColor(exam.type)}>{exam.type.toUpperCase()}</Badge>
                          {exam.attempt > 1 && (
                            <Badge variant="secondary" className="text-xs">
                              Intento #{exam.attempt}
                            </Badge>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{exam.assignmentName}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {exam.time}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {exam.location}
                            </div>
                            {exam.completed && exam.grade && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                <span className={`font-medium ${getGradeColor(exam.grade)}`}>{exam.grade}/100</span>
                                {exam.gradePercentile && (
                                  <span className="text-xs text-gray-500">
                                    (Percentil {100 - exam.gradePercentile}%)
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          {exam.notes && <p className="text-sm text-gray-600 mt-1">{exam.notes}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!exam.completed && (
                          <Button size="sm" variant="outline" onClick={() => handleCompleteExam(exam)}>
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {!exam.completed && isPastDate(exam.date) && (
                          <Button size="sm" variant="outline" onClick={() => handleAddGrade(exam)}>
                            Agregar Nota
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditExam(exam)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            {exam.completed && (
                              <DropdownMenuItem onClick={() => handleAddGrade(exam)}>
                                <Star className="w-4 h-4 mr-2" />
                                Editar Nota
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDeleteExam(exam.id)} className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Exam Dialog */}
      <Dialog open={showAddExamDialog} onOpenChange={setShowAddExamDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingExam ? "Editar Examen" : "Agregar Examen"}</DialogTitle>
            <DialogDescription>
              {editingExam ? "Modifica los detalles del examen" : "Programa un nuevo examen"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="assignment">Materia</Label>
              <Select
                value={newExam.assignmentId}
                onValueChange={(value) => setNewExam({ ...newExam, assignmentId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una materia" />
                </SelectTrigger>
                <SelectContent>
                  {assignments.map((assignment) => (
                    <SelectItem key={assignment.id} value={assignment.id}>
                      <div className="flex items-center gap-2">
                        {assignment.code && <span className="font-mono text-xs">{assignment.code}</span>}
                        <span>{assignment.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={newExam.date}
                  onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="time">Hora</Label>
                <Input
                  id="time"
                  type="time"
                  value={newExam.time}
                  onChange={(e) => setNewExam({ ...newExam, time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                value={newExam.location}
                onChange={(e) => setNewExam({ ...newExam, location: e.target.value })}
                placeholder="Ej: Aula 101, Hospital Central"
              />
            </div>

            <div>
              <Label htmlFor="type">Tipo de Examen</Label>
              <Select value={newExam.type} onValueChange={(value: any) => setNewExam({ ...newExam, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parcial">Parcial</SelectItem>
                  <SelectItem value="final">Final</SelectItem>
                  <SelectItem value="oral">Oral</SelectItem>
                  <SelectItem value="practico">Práctico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notas (Opcional)</Label>
              <Textarea
                id="notes"
                value={newExam.notes}
                onChange={(e) => setNewExam({ ...newExam, notes: e.target.value })}
                placeholder="Temas a estudiar, materiales necesarios, etc."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button onClick={handleSubmitExam} disabled={!newExam.assignmentId || !newExam.date}>
                {editingExam ? "Actualizar" : "Agregar"} Examen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Past Date Warning Dialog */}
      <Dialog open={showPastDateDialog} onOpenChange={setShowPastDateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Fecha Anterior Detectada
            </DialogTitle>
            <DialogDescription>La fecha seleccionada es anterior a hoy. ¿Ya realizaste este examen?</DialogDescription>
          </DialogHeader>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Si ya realizaste este examen, podrás agregar tu calificación inmediatamente después de confirmarlo.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowPastDateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handlePastDateConfirm}>Sí, Continuar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Grade Input Dialog */}
      <Dialog open={showGradeDialog} onOpenChange={setShowGradeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Calificación</DialogTitle>
            <DialogDescription>Ingresa tu calificación para {editingExam?.assignmentName}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="grade">Calificación (0-100)</Label>
              <Input
                id="grade"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={newExam.grade}
                onChange={(e) => setNewExam({ ...newExam, grade: e.target.value })}
                placeholder="Ej: 85.5"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowGradeDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleGradeSubmit} disabled={!newExam.grade}>
                Guardar Calificación
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Completion Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Marcar como Completado</DialogTitle>
            <DialogDescription>
              Marca el examen como completado y opcionalmente agrega una calificación
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium">{completingExam?.assignmentName}</h4>
              <p className="text-sm text-gray-600">
                {completingExam?.type.toUpperCase()} •{" "}
                {completingExam && new Date(completingExam.date).toLocaleDateString("es")}
              </p>
            </div>

            <div>
              <Label htmlFor="completion-grade">Calificación (Opcional)</Label>
              <Input
                id="completion-grade"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={newExam.grade}
                onChange={(e) => setNewExam({ ...newExam, grade: e.target.value })}
                placeholder="Ej: 85.5"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCompletionDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmitCompletion}>Marcar Completado</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
