"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

interface ImportExportProps {
  onImport: (data: any) => void
  onExport: () => any
}

export function ImportExport({ onImport, onExport }: ImportExportProps) {
  const [importData, setImportData] = useState("")
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle")
  const [importMessage, setImportMessage] = useState("")
  const { t } = useLanguage()

  const handleExport = () => {
    try {
      const data = onExport()
      const jsonString = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonString], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `university-tracker-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export error:", error)
    }
  }

  const handleImport = () => {
    try {
      if (!importData.trim()) {
        setImportStatus("error")
        setImportMessage("Por favor ingresa datos JSON válidos")
        return
      }

      const data = JSON.parse(importData)

      // Handle both old format (array) and new format (object with assignments and electives)
      if (Array.isArray(data)) {
        // Old format - validate as assignments array
        const isValid = data.every(
          (item) =>
            item &&
            typeof item === "object" &&
            typeof item.id === "string" &&
            typeof item.name === "string" &&
            typeof item.credits === "number" &&
            typeof item.year === "number" &&
            typeof item.semester === "number" &&
            typeof item.category === "string" &&
            Array.isArray(item.prerequisites),
        )

        if (!isValid) {
          setImportStatus("error")
          setImportMessage("Formato de datos inválido. Verifica que todos los campos requeridos estén presentes.")
          return
        }

        onImport(data)
        setImportStatus("success")
        setImportMessage(`Se importaron ${data.length} asignaturas exitosamente`)
      } else if (data && typeof data === "object") {
        // New format - validate object structure
        let importCount = 0
        const importDetails = []

        if (data.assignments && Array.isArray(data.assignments)) {
          const isValidAssignments = data.assignments.every(
            (item: any) =>
              item &&
              typeof item === "object" &&
              typeof item.id === "string" &&
              typeof item.name === "string" &&
              typeof item.credits === "number" &&
              typeof item.year === "number" &&
              typeof item.semester === "number" &&
              typeof item.category === "string" &&
              Array.isArray(item.prerequisites),
          )

          if (!isValidAssignments) {
            setImportStatus("error")
            setImportMessage(
              "Formato de asignaturas inválido. Verifica que todos los campos requeridos estén presentes.",
            )
            return
          }

          importCount += data.assignments.length
          importDetails.push(`${data.assignments.length} asignaturas`)
        }

        if (data.customElectives && Array.isArray(data.customElectives)) {
          const isValidElectives = data.customElectives.every(
            (item: any) =>
              item &&
              typeof item === "object" &&
              typeof item.id === "string" &&
              typeof item.name === "string" &&
              typeof item.code === "string" &&
              typeof item.credits === "number",
          )

          if (!isValidElectives) {
            setImportStatus("error")
            setImportMessage(
              "Formato de optativas personalizadas inválido. Verifica que todos los campos requeridos estén presentes.",
            )
            return
          }

          importCount += data.customElectives.length
          importDetails.push(`${data.customElectives.length} optativas personalizadas`)
        }

        if (importCount === 0) {
          setImportStatus("error")
          setImportMessage("No se encontraron datos válidos para importar.")
          return
        }

        onImport(data)
        setImportStatus("success")
        setImportMessage(`Se importaron exitosamente: ${importDetails.join(", ")}`)
      } else {
        setImportStatus("error")
        setImportMessage(
          "Formato de datos no reconocido. Debe ser un array de asignaturas o un objeto con asignaturas y optativas.",
        )
        return
      }

      setImportData("")
    } catch (error) {
      setImportStatus("error")
      setImportMessage("Error al procesar los datos JSON. Verifica el formato.")
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setImportData(content)
      setImportStatus("idle")
      setImportMessage("")
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Exportar Datos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Descarga todos tus datos de asignaturas y optativas personalizadas en formato JSON para hacer respaldo o
              transferir a otro dispositivo.
            </p>
            <Button onClick={handleExport} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Descargar JSON
            </Button>
          </CardContent>
        </Card>

        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Importar Datos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Carga datos de asignaturas y optativas desde un archivo JSON o pega el contenido directamente.
            </p>

            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium mb-2">
                Subir archivo JSON
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div>
              <label htmlFor="json-data" className="block text-sm font-medium mb-2">
                O pega el JSON aquí
              </label>
              <Textarea
                id="json-data"
                value={importData}
                onChange={(e) => {
                  setImportData(e.target.value)
                  setImportStatus("idle")
                  setImportMessage("")
                }}
                placeholder="Pega aquí el contenido JSON..."
                rows={6}
                className="font-mono text-xs"
              />
            </div>

            <Button onClick={handleImport} className="w-full" disabled={!importData.trim()}>
              <Upload className="h-4 w-4 mr-2" />
              Importar Datos
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Status Messages */}
      {importStatus !== "idle" && (
        <Alert className={importStatus === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          {importStatus === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={importStatus === "success" ? "text-green-800" : "text-red-800"}>
            {importMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Data Format Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Formato de Datos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Los datos pueden estar en formato JSON con cualquiera de estas estructuras:
          </p>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Formato Completo (Recomendado):</h4>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-xs overflow-x-auto">
                {`{
  "assignments": [
    {
      "id": "unique-id",
      "name": "Nombre de la Asignatura",
      "code": "COD123",
      "credits": 5,
      "year": 1,
      "semester": 1,
      "category": "core",
      "prerequisites": ["prerequisite-id"],
      "completed": false,
      "instructor": "Nombre del Profesor",
      "schedule": "Lunes 8:00-10:00",
      "location": "Aula 101",
      "requiresFullYear": [1, 2],
      "orPrerequisites": [["id1"], ["id2", "id3"]],
      "requiresAtLeastOne": ["id4", "id5"]
    }
  ],
  "customElectives": [
    {
      "id": "custom-id",
      "name": "Optativa Personalizada",
      "code": "OPT123",
      "credits": 5,
      "dependencies": ["prerequisite-id"],
      "description": "Descripción de la optativa",
      "area": "Área de estudio",
      "availableYears": [4, 5, 6]
    }
  ]
}`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">Formato Simple (Solo Asignaturas):</h4>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-xs overflow-x-auto">
                {`[
  {
    "id": "unique-id",
    "name": "Nombre de la Asignatura",
    "code": "COD123",
    "credits": 5,
    "year": 1,
    "semester": 1,
    "category": "core",
    "prerequisites": ["prerequisite-id"],
    "completed": false
  }
]`}
              </pre>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Campos requeridos para asignaturas:</strong> id, name, credits, year, semester, category,
              prerequisites, completed
            </p>
            <p>
              <strong>Campos requeridos para optativas:</strong> id, name, code, credits
            </p>
            <p>
              <strong>Categorías válidas:</strong> core, elective, clinical, basic, internship
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
