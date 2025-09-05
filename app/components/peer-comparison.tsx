"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, TrendingUp, Award, BarChart3, Target, Star, ArrowUp, ArrowDown, Minus } from "lucide-react"
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

interface PeerData {
  id: string
  name: string
  careerGoal: string
  completedCredits: number
  currentYear: number
  gpa: number
  electivesCompleted: string[]
  specializations: string[]
  performance: "excellent" | "good" | "average" | "below_average"
}

interface PeerComparisonProps {
  assignments: Assignment[]
  completedAssignments: Set<string>
  selectedCareerGoal: string | null
  currentYear: number
}

// Generate mock peer data based on career goal
const generatePeerData = (careerGoal: string | null, currentYear: number): PeerData[] => {
  if (!careerGoal) return []

  const basePeers: Partial<PeerData>[] = [
    {
      name: "Ana García",
      performance: "excellent",
      gpa: 4.2,
      specializations: ["research", "clinical_excellence"],
    },
    {
      name: "Carlos Mendoza",
      performance: "good",
      gpa: 3.8,
      specializations: ["leadership", "community_service"],
    },
    {
      name: "María Rodriguez",
      performance: "excellent",
      gpa: 4.0,
      specializations: ["international_experience", "research"],
    },
    {
      name: "Diego López",
      performance: "good",
      gpa: 3.7,
      specializations: ["clinical_skills", "teamwork"],
    },
    {
      name: "Sofia Herrera",
      performance: "average",
      gpa: 3.5,
      specializations: ["community_service", "clinical_skills"],
    },
    {
      name: "Andrés Castro",
      performance: "excellent",
      gpa: 4.1,
      specializations: ["research", "leadership"],
    },
  ]

  return basePeers.map((peer, index) => ({
    id: `peer-${index}`,
    name: peer.name!,
    careerGoal,
    completedCredits: Math.floor(Math.random() * 20) + currentYear * 25 + (Math.random() * 10 - 5),
    currentYear: currentYear + (Math.random() > 0.7 ? 1 : Math.random() < 0.3 ? -1 : 0),
    gpa: peer.gpa!,
    electivesCompleted: [
      "advanced-anatomy",
      "clinical-research",
      "medical-ethics",
      "global-health",
      "emergency-medicine",
    ].slice(0, Math.floor(Math.random() * 3) + 2),
    specializations: peer.specializations!,
    performance: peer.performance!,
  }))
}

export function PeerComparison({
  assignments,
  completedAssignments,
  selectedCareerGoal,
  currentYear,
}: PeerComparisonProps) {
  const { t, language } = useLanguage()
  const [selectedPeer, setSelectedPeer] = useState<string | null>(null)

  const peerData = generatePeerData(selectedCareerGoal, currentYear)

  // Calculate user stats
  const userCompletedCredits = assignments
    .filter((a) => completedAssignments.has(a.id))
    .reduce((sum, a) => sum + a.credits, 0)

  const userGPA = 3.6 // Mock GPA
  const userElectives = assignments.filter((a) => completedAssignments.has(a.id) && a.category === "elective").length

  // Calculate peer statistics
  const peerStats = {
    avgCredits: peerData.reduce((sum, p) => sum + p.completedCredits, 0) / Math.max(peerData.length, 1),
    avgGPA: peerData.reduce((sum, p) => sum + p.gpa, 0) / Math.max(peerData.length, 1),
    avgElectives: peerData.reduce((sum, p) => sum + p.electivesCompleted.length, 0) / Math.max(peerData.length, 1),
  }

  // Performance comparison
  const getPerformanceComparison = (userValue: number, peerAvg: number) => {
    const diff = ((userValue - peerAvg) / peerAvg) * 100
    if (Math.abs(diff) < 5) return "similar"
    return diff > 0 ? "above" : "below"
  }

  const getComparisonIcon = (comparison: string) => {
    switch (comparison) {
      case "above":
        return <ArrowUp className="w-4 h-4 text-green-600" />
      case "below":
        return <ArrowDown className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-gray-600" />
    }
  }

  const getComparisonColor = (comparison: string) => {
    switch (comparison) {
      case "above":
        return "text-green-600 bg-green-50 border-green-200"
      case "below":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getPerformanceBadgeColor = (performance: string) => {
    switch (performance) {
      case "excellent":
        return "bg-green-100 text-green-800 border-green-300"
      case "good":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "average":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      default:
        return "bg-red-100 text-red-800 border-red-300"
    }
  }

  if (!selectedCareerGoal) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">{t("select_career_goal")}</h3>
          <p className="text-sm text-gray-500">
            {language === "es"
              ? "Selecciona un objetivo profesional para comparar tu progreso con otros estudiantes"
              : "Select a career goal to compare your progress with other students"}
          </p>
        </CardContent>
      </Card>
    )
  }

  const creditsComparison = getPerformanceComparison(userCompletedCredits, peerStats.avgCredits)
  const gpaComparison = getPerformanceComparison(userGPA, peerStats.avgGPA)
  const electivesComparison = getPerformanceComparison(userElectives, peerStats.avgElectives)

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            {t("peer_comparison")}
          </CardTitle>
          <CardDescription>
            {language === "es"
              ? "Compara tu progreso académico con estudiantes que tienen objetivos profesionales similares"
              : "Compare your academic progress with students who have similar career goals"}
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            {language === "es" ? "Resumen" : "Overview"}
          </TabsTrigger>
          <TabsTrigger value="detailed" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            {language === "es" ? "Detallado" : "Detailed"}
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            {language === "es" ? "Perspectivas" : "Insights"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">{t("completed_credits")}</h4>
                  {getComparisonIcon(creditsComparison)}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{language === "es" ? "Tú" : "You"}</span>
                    <span className="text-sm font-bold">{userCompletedCredits}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">
                      {language === "es" ? "Promedio de pares" : "Peer Average"}
                    </span>
                    <span className="text-sm text-gray-600">{Math.round(peerStats.avgCredits)}</span>
                  </div>
                  <Badge className={`text-xs ${getComparisonColor(creditsComparison)}`}>
                    {creditsComparison === "above" && (language === "es" ? "Por encima del promedio" : "Above Average")}
                    {creditsComparison === "below" && (language === "es" ? "Por debajo del promedio" : "Below Average")}
                    {creditsComparison === "similar" &&
                      (language === "es" ? "Similar al promedio" : "Similar to Average")}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">{t("gpa")}</h4>
                  {getComparisonIcon(gpaComparison)}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{language === "es" ? "Tú" : "You"}</span>
                    <span className="text-sm font-bold">{userGPA.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">
                      {language === "es" ? "Promedio de pares" : "Peer Average"}
                    </span>
                    <span className="text-sm text-gray-600">{peerStats.avgGPA.toFixed(1)}</span>
                  </div>
                  <Badge className={`text-xs ${getComparisonColor(gpaComparison)}`}>
                    {gpaComparison === "above" && (language === "es" ? "Por encima del promedio" : "Above Average")}
                    {gpaComparison === "below" && (language === "es" ? "Por debajo del promedio" : "Below Average")}
                    {gpaComparison === "similar" && (language === "es" ? "Similar al promedio" : "Similar to Average")}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    {language === "es" ? "Optativas Completadas" : "Electives Completed"}
                  </h4>
                  {getComparisonIcon(electivesComparison)}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{language === "es" ? "Tú" : "You"}</span>
                    <span className="text-sm font-bold">{userElectives}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">
                      {language === "es" ? "Promedio de pares" : "Peer Average"}
                    </span>
                    <span className="text-sm text-gray-600">{Math.round(peerStats.avgElectives)}</span>
                  </div>
                  <Badge className={`text-xs ${getComparisonColor(electivesComparison)}`}>
                    {electivesComparison === "above" &&
                      (language === "es" ? "Por encima del promedio" : "Above Average")}
                    {electivesComparison === "below" &&
                      (language === "es" ? "Por debajo del promedio" : "Below Average")}
                    {electivesComparison === "similar" &&
                      (language === "es" ? "Similar al promedio" : "Similar to Average")}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Visualization */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {language === "es" ? "Comparación de Progreso" : "Progress Comparison"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{language === "es" ? "Tu Progreso" : "Your Progress"}</span>
                    <span className="text-sm text-gray-600">
                      {Math.round((userCompletedCredits / (currentYear * 30)) * 100)}%
                    </span>
                  </div>
                  <Progress value={(userCompletedCredits / (currentYear * 30)) * 100} className="h-3" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {language === "es" ? "Promedio de Pares" : "Peer Average"}
                    </span>
                    <span className="text-sm text-gray-600">
                      {Math.round((peerStats.avgCredits / (currentYear * 30)) * 100)}%
                    </span>
                  </div>
                  <Progress value={(peerStats.avgCredits / (currentYear * 30)) * 100} className="h-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          {/* Individual Peer Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {language === "es" ? "Estudiantes Similares" : "Similar Students"}
              </CardTitle>
              <CardDescription>
                {language === "es"
                  ? "Estudiantes con el mismo objetivo profesional"
                  : "Students with the same career goal"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {peerData.slice(0, 6).map((peer) => (
                  <Card
                    key={peer.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedPeer === peer.id ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => setSelectedPeer(selectedPeer === peer.id ? null : peer.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div>
                            <h4 className="font-medium text-sm">{peer.name}</h4>
                            <p className="text-xs text-gray-600">
                              {language === "es" ? "Año" : "Year"} {peer.currentYear} • {peer.completedCredits}{" "}
                              {t("credits")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPerformanceBadgeColor(peer.performance)}>{peer.performance}</Badge>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs">{peer.gpa.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>

                      {selectedPeer === peer.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h5 className="text-xs font-medium text-gray-700 mb-2">
                                {language === "es" ? "Especializaciones" : "Specializations"}
                              </h5>
                              <div className="flex flex-wrap gap-1">
                                {peer.specializations.map((spec) => (
                                  <Badge key={spec} variant="outline" className="text-xs">
                                    {spec.replace(/_/g, " ")}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h5 className="text-xs font-medium text-gray-700 mb-2">
                                {language === "es" ? "Optativas Completadas" : "Completed Electives"}
                              </h5>
                              <p className="text-xs text-gray-600">
                                {peer.electivesCompleted.length} {language === "es" ? "optativas" : "electives"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* Performance Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                {language === "es" ? "Perspectivas de Rendimiento" : "Performance Insights"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-sm text-blue-800 mb-2">
                    {language === "es" ? "Fortalezas Identificadas" : "Identified Strengths"}
                  </h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    {creditsComparison === "above" && (
                      <li>• {language === "es" ? "Progreso académico acelerado" : "Accelerated academic progress"}</li>
                    )}
                    {gpaComparison === "above" && (
                      <li>
                        • {language === "es" ? "Excelencia académica consistente" : "Consistent academic excellence"}
                      </li>
                    )}
                    {electivesComparison === "above" && (
                      <li>
                        • {language === "es" ? "Exploración diversa de optativas" : "Diverse elective exploration"}
                      </li>
                    )}
                  </ul>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-sm text-yellow-800 mb-2">
                    {language === "es" ? "Áreas de Mejora" : "Areas for Improvement"}
                  </h4>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    {creditsComparison === "below" && (
                      <li>
                        •{" "}
                        {language === "es"
                          ? "Considerar aumentar la carga de créditos"
                          : "Consider increasing credit load"}
                      </li>
                    )}
                    {gpaComparison === "below" && (
                      <li>
                        •{" "}
                        {language === "es"
                          ? "Enfocarse en mejorar el rendimiento académico"
                          : "Focus on improving academic performance"}
                      </li>
                    )}
                    {electivesComparison === "below" && (
                      <li>
                        • {language === "es" ? "Explorar más optativas relevantes" : "Explore more relevant electives"}
                      </li>
                    )}
                  </ul>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-sm text-green-800 mb-2">
                    {language === "es" ? "Recomendaciones" : "Recommendations"}
                  </h4>
                  <ul className="text-xs text-green-700 space-y-1">
                    <li>
                      •{" "}
                      {language === "es"
                        ? "Conectar con estudiantes de alto rendimiento"
                        : "Connect with high-performing students"}
                    </li>
                    <li>• {language === "es" ? "Participar en grupos de estudio" : "Participate in study groups"}</li>
                    <li>
                      • {language === "es" ? "Buscar oportunidades de mentoría" : "Seek mentorship opportunities"}
                    </li>
                    <li>
                      •{" "}
                      {language === "es"
                        ? "Considerar actividades extracurriculares"
                        : "Consider extracurricular activities"}
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
