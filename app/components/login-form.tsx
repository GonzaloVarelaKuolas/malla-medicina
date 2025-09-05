"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Loader2, LogIn, X } from 'lucide-react'
import { useAuth } from "./auth-provider"
import { useLanguage } from "@/hooks/use-language"

interface LoginFormProps {
  onClose?: () => void
}

export function LoginForm({ onClose }: LoginFormProps) {
  const { t } = useLanguage()
  const { login, loginWithAzure, isLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    try {
      await login(email, password)
      onClose?.()
    } catch (err) {
      setError("Invalid credentials")
    }
  }

  const handleAzureLogin = async () => {
    setError("")
    try {
      await loginWithAzure()
      onClose?.()
    } catch (err) {
      setError("Azure login failed")
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center relative">
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <CardTitle className="text-2xl">{t("signIn")}</CardTitle>
        <CardDescription>{t("signInToSyncData")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleAzureLogin}
          disabled={isLoading}
          className="w-full"
          variant="outline"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <LogIn className="w-4 h-4 mr-2" />
          )}
          {t("loginWithAzure")}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">{t("or")}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4 mr-2" />
            )}
            {t("signIn")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
