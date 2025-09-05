"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
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
  orPrerequisites?: string[][]
  requiresAtLeastOne?: string[]
}

interface AssignmentManagerProps {
  isOpen: boolean
  onClose: () => void
  onAddAssignment: (assignment: Assignment) => void
  existingAssignments: Assignment[]
  editingAssignment?: Assignment | null
  maxYear: number
}

export function AssignmentManager({
  isOpen,
  onClose,
  onAddAssignment,
  existingAssignments,
  editingAssignment,
  maxYear,
}: AssignmentManagerProps) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    credits: 1,
    year: 1,
    semester: 1,
    category: "core" as const,
    prerequisites: [] as string[],
    instructor: "",
    schedule: "",
    location: "",
    requiresFullYear: [] as number[],
    orPrerequisites: [] as string[][],
    requiresAtLeastOne: [] as string[],
  })

  // Reset form when dialog opens/closes or when editing assignment changes
  useEffect(() => {
    if (editingAssignment) {
      setFormData({
        name: editingAssignment.name,
        code: editingAssignment.code || "",
        credits: editingAssignment.credits,
        year: editingAssignment.year,
        semester: editingAssignment.semester,
        category: editingAssignment.category,
        prerequisites: editingAssignment.prerequisites || [],
        instructor: editingAssignment.instructor || "",
        schedule: editingAssignment.schedule || "",
        location: editingAssignment.location || "",
        requiresFullYear: editingAssignment.requiresFullYear || [],
        orPrerequisites: editingAssignment.orPrerequisites || [],
        requiresAtLeastOne: editingAssignment.requiresAtLeastOne || [],
      })
    } else {
      setFormData({
        name: "",
        code: "",
        credits: 1,
        year: 1,
        semester: 1,
        category: "core",
        prerequisites: [],
        instructor: "",
        schedule: "",
        location: "",
        requiresFullYear: [],
        orPrerequisites: [],
        requiresAtLeastOne: [],
      })
    }
  }, [editingAssignment, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    const assignment: Assignment = {
      id: editingAssignment?.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: formData.name.trim(),
      code: formData.code.trim() || undefined,
      credits: formData.credits,
      year: formData.year,
      semester: formData.semester,
      category: formData.category,
      prerequisites: formData.prerequisites,
      completed: editingAssignment?.completed || false,
      instructor: formData.instructor.trim() || undefined,
      schedule: formData.schedule.trim() || undefined,
      location: formData.location.trim() || undefined,
      requiresFullYear: formData.requiresFullYear.length > 0 ? formData.requiresFullYear : undefined,
      orPrerequisites: formData.orPrerequisites.length > 0 ? formData.orPrerequisites : undefined,
      requiresAtLeastOne: formData.requiresAtLeastOne.length > 0 ? formData.requiresAtLeastOne : undefined,
    }

    onAddAssignment(assignment)
    onClose()
  }

  const handlePrerequisiteToggle = (assignmentId: string) => {
    setFormData((prev) => ({
      ...prev,
      prerequisites: prev.prerequisites.includes(assignmentId)
        ? prev.prerequisites.filter((id) => id !== assignmentId)
        : [...prev.prerequisites, assignmentId],
    }))
  }

  const handleRequiresAtLeastOneToggle = (assignmentId: string) => {
    setFormData((prev) => ({
      ...prev,
      requiresAtLeastOne: prev.requiresAtLeastOne.includes(assignmentId)
        ? prev.requiresAtLeastOne.filter((id) => id !== assignmentId)
        : [...prev.requiresAtLeastOne, assignmentId],
    }))
  }

  const handleFullYearToggle = (year: number) => {
    setFormData((prev) => ({
      ...prev,
      requiresFullYear: prev.requiresFullYear.includes(year)
        ? prev.requiresFullYear.filter((y) => y !== year)
        : [...prev.requiresFullYear, year],
    }))
  }

  const availableAssignments = existingAssignments.filter(
    (assignment) => assignment && assignment.id !== editingAssignment?.id,
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingAssignment ? t("actions.editAssignment") : t("actions.addAssignment")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">{t("form.name")} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t("form.namePlaceholder")}
                required
              />
            </div>
            <div>
              <Label htmlFor="code">{t("form.code")}</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder={t("form.codePlaceholder")}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="credits">{t("form.credits")} *</Label>
              <Input
                id="credits"
                type="number"
                min="1"
                max="50"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: Number.parseInt(e.target.value) || 1 })}
                required
              />
            </div>
            <div>
              <Label htmlFor="year">{t("form.year")} *</Label>
              <Select
                value={formData.year.toString()}
                onValueChange={(value) => setFormData({ ...formData, year: Number.parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: maxYear }, (_, i) => i + 1).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {t(`year.${year}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="semester">{t("form.semester")} *</Label>
              <Select
                value={formData.semester.toString()}
                onValueChange={(value) => setFormData({ ...formData, semester: Number.parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{t("semester.1")}</SelectItem>
                  <SelectItem value="2">{t("semester.2")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="category">{t("form.category")} *</Label>
            <Select
              value={formData.category}
              onValueChange={(value: any) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="core">{t("category.core")}</SelectItem>
                <SelectItem value="elective">{t("category.elective")}</SelectItem>
                <SelectItem value="clinical">{t("category.clinical")}</SelectItem>
                <SelectItem value="basic">{t("category.basic")}</SelectItem>
                <SelectItem value="internship">{t("category.internship")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="instructor">{t("form.instructor")}</Label>
              <Input
                id="instructor"
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                placeholder={t("form.instructorPlaceholder")}
              />
            </div>
            <div>
              <Label htmlFor="schedule">{t("form.schedule")}</Label>
              <Input
                id="schedule"
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                placeholder={t("form.schedulePlaceholder")}
              />
            </div>
            <div>
              <Label htmlFor="location">{t("form.location")}</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder={t("form.locationPlaceholder")}
              />
            </div>
          </div>

          {/* Full Year Requirements */}
          <div>
            <Label>{t("prerequisites.fullYear")}</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {Array.from({ length: maxYear }, (_, i) => i + 1).map((year) => (
                <div key={year} className="flex items-center space-x-2">
                  <Checkbox
                    id={`fullYear-${year}`}
                    checked={formData.requiresFullYear.includes(year)}
                    onCheckedChange={() => handleFullYearToggle(year)}
                  />
                  <Label htmlFor={`fullYear-${year}`} className="text-sm">
                    {t(`year.${year}`)}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Prerequisites */}
          {availableAssignments.length > 0 && (
            <div>
              <Label>{t("prerequisites.title")}</Label>
              <div className="max-h-40 overflow-y-auto border rounded-md p-3 mt-2">
                <div className="space-y-2">
                  {availableAssignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`prereq-${assignment.id}`}
                        checked={formData.prerequisites.includes(assignment.id)}
                        onCheckedChange={() => handlePrerequisiteToggle(assignment.id)}
                      />
                      <Label htmlFor={`prereq-${assignment.id}`} className="text-sm flex-1">
                        <Badge variant="outline" className="mr-2 text-xs">
                          {assignment.code || assignment.name}
                        </Badge>
                        {assignment.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* At Least One Requirements */}
          {availableAssignments.length > 0 && (
            <div>
              <Label>Requiere al menos uno de:</Label>
              <div className="max-h-40 overflow-y-auto border rounded-md p-3 mt-2">
                <div className="space-y-2">
                  {availableAssignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`atleastone-${assignment.id}`}
                        checked={formData.requiresAtLeastOne.includes(assignment.id)}
                        onCheckedChange={() => handleRequiresAtLeastOneToggle(assignment.id)}
                      />
                      <Label htmlFor={`atleastone-${assignment.id}`} className="text-sm flex-1">
                        <Badge variant="outline" className="mr-2 text-xs">
                          {assignment.code || assignment.name}
                        </Badge>
                        {assignment.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("actions.cancel")}
            </Button>
            <Button type="submit">
              {editingAssignment ? t("actions.updateAssignment") : t("actions.addAssignment")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
