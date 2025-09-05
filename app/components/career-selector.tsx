"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Stethoscope, BookOpen, Users, Heart } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

interface CareerSelectorProps {
  isOpen: boolean
  onSelect: (career: string) => void
  onClose: () => void
}

export function CareerSelector({ isOpen, onSelect, onClose }: CareerSelectorProps) {
  const { t } = useLanguage()
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null)

  const careers = [
    {
      id: "medicine",
      name: "Medicina",
      description: "Carrera de 7 años enfocada en ciencias médicas, diagnóstico y tratamiento de enfermedades",
      icon: <Stethoscope className="w-8 h-8 text-red-600" />,
      color: "border-red-200 hover:border-red-300 bg-red-50",
      years: 7,
      features: [
        "Ciencias básicas médicas",
        "Clínicas médicas especializadas",
        "Rotaciones hospitalarias",
        "Internado médico",
        "Especialidades médicas",
        "Investigación clínica",
      ],
    },
  ]

  const handleSelect = () => {
    if (selectedCareer) {
      onSelect(selectedCareer)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Selecciona tu Carrera
          </DialogTitle>
          <DialogDescription>
            Elige tu programa académico para configurar tu plan de estudios personalizado
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 py-4">
          {careers.map((career) => (
            <Card
              key={career.id}
              className={`cursor-pointer transition-all duration-200 ${career.color} ${
                selectedCareer === career.id ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setSelectedCareer(career.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">{career.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{career.name}</h3>
                      <span className="text-sm font-medium text-gray-600 bg-white px-2 py-1 rounded">
                        {career.years} años
                      </span>
                    </div>
                    <p className="text-gray-700 mb-4">{career.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {career.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>Configuración personalizada según tu carrera</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSelect} disabled={!selectedCareer}>
              <Heart className="w-4 h-4 mr-2" />
              Comenzar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
