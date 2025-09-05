"use client"

import type React from "react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Plus, Minus } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

interface YearEditorProps {
  isOpen: boolean
  onClose: () => void
  currentYears: number
  onUpdateYears: (years: number) => void
}

export function YearEditor({ isOpen, onClose, currentYears, onUpdateYears }: YearEditorProps) {
  const { t } = useLanguage()
  const [years, setYears] = useState(currentYears)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdateYears(years)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("editYears")}</DialogTitle>
          <DialogDescription>{t("editYearsDescription")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="years">{t("currentYears")}</Label>
            <div className="flex items-center space-x-2">
              <Button type="button" variant="outline" size="icon" onClick={() => setYears(Math.max(1, years - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="years"
                type="number"
                min="1"
                max="10"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="text-center"
              />
              <Button type="button" variant="outline" size="icon" onClick={() => setYears(Math.min(10, years + 1))}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit">{t("updateYears")}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
