"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
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
  instructor?: string
  schedule?: string
  location?: string
}

interface AssignmentEditorProps {
  isOpen: boolean
  onClose: () => void
  onUpdateAssignment: (assignment: Assignment) => void
  assignment: Assignment | null
  existingAssignments: Assignment[]
  maxYear: number
}

export function AssignmentEditor({
  isOpen,
  onClose,
  onUpdateAssignment,
  assignment,
  existingAssignments,
  maxYear,
}: AssignmentEditorProps) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    credits: 3,
    dependencies: [] as string[],
    instructor: "",
    schedule: "",
    location: "",
  })

  useEffect(() => {
    if (assignment) {
      setFormData({
        name: assignment.name,
        code: assignment.code || "",
        credits: assignment.credits,
        dependencies: assignment.dependencies,
        instructor: assignment.instructor || "",
        schedule: assignment.schedule || "",
        location: assignment.location || "",
      })
    }
  }, [assignment])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!assignment) return

    const updatedAssignment: Assignment = {
      ...assignment,
      name: formData.name,
      code: formData.code,
      credits: formData.credits,
      dependencies: formData.dependencies,
      instructor: formData.instructor || undefined,
      schedule: formData.schedule || undefined,
      location: formData.location || undefined,
    }

    onUpdateAssignment(updatedAssignment)
    onClose()
  }

  const toggleDependency = (assignmentId: string) => {
    setFormData((prev) => ({
      ...prev,
      dependencies: prev.dependencies.includes(assignmentId)
        ? prev.dependencies.filter((id) => id !== assignmentId)
        : [...prev.dependencies, assignmentId],
    }))
  }

  const availableDependencies = existingAssignments.filter(
    (a) => a.year <= (assignment?.year || 1) && a.id !== assignment?.id,
  )

  // Helper functions for semester numbering system
  const getSemesterNumber = (year: number, semester: 1 | 2): number => {
    return (year - 1) * 2 + semester
  }

  if (!assignment) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Materia</DialogTitle>
          <DialogDescription>Modifica los detalles de la materia seleccionada</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre de la Materia</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="ej. Anatomía Humana"
                required
              />
            </div>
            <div>
              <Label htmlFor="code">Código de la Materia</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                placeholder="ej. AH101"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="credits">Créditos</Label>
            <Input
              id="credits"
              type="number"
              min="1"
              value={formData.credits}
              onChange={(e) => setFormData((prev) => ({ ...prev, credits: Number.parseInt(e.target.value) }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="instructor">Profesor/Instructor *</Label>
              <Input
                id="instructor"
                value={formData.instructor}
                onChange={(e) => setFormData((prev) => ({ ...prev, instructor: e.target.value }))}
                placeholder="ej. Dr. García López"
              />
              <p className="text-xs text-gray-500 mt-1">* Campo opcional</p>
            </div>
            <div>
              <Label htmlFor="schedule">Horario *</Label>
              <Input
                id="schedule"
                value={formData.schedule}
                onChange={(e) => setFormData((prev) => ({ ...prev, schedule: e.target.value }))}
                placeholder="ej. Lun-Vie 8:00-10:00"
              />
              <p className="text-xs text-gray-500 mt-1">* Campo opcional</p>
            </div>
            <div>
              <Label htmlFor="location">Ubicación *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="ej. Aula 205, Edificio A"
              />
              <p className="text-xs text-gray-500 mt-1">* Campo opcional</p>
            </div>
          </div>

          <div className="mb-3 p-2 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Ubicación Actual:</strong> Año {assignment?.year}, Semestre{" "}
              {assignment ? getSemesterNumber(assignment.year, assignment.semester) : ""}
            </p>
          </div>

          <div>
            <Label>Dependencias Individuales</Label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Selecciona materias específicas requeridas</p>
            <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-2">
              {availableDependencies.map((dep) => (
                <div key={dep.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={dep.id}
                    checked={formData.dependencies.includes(dep.id)}
                    onCheckedChange={() => toggleDependency(dep.id)}
                  />
                  <Label htmlFor={dep.id} className="flex-1 text-sm">
                    {dep.code} - {dep.name}
                  </Label>
                  <Badge variant="outline" className="text-xs">
                    Año {dep.year}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {formData.dependencies.length > 0 && (
            <div>
              <Label>Requisitos Seleccionados</Label>
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.dependencies.map((depId) => {
                  const dep = existingAssignments.find((a) => a.id === depId)
                  return (
                    <Badge key={depId} variant="secondary" className="flex items-center gap-1 text-xs">
                      {dep?.code}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => toggleDependency(depId)} />
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Actualizar Materia</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
