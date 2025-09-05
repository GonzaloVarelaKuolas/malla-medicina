"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, UserCheck, LogIn } from 'lucide-react'
import { useAuth } from "./auth-provider"
import { useLanguage } from "@/hooks/use-language"
import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { LoginForm } from "./login-form"

export function UserMenu() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const [showLoginDialog, setShowLoginDialog] = useState(false)

  if (!user) return null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback>
                {user.isGuest ? (
                  <UserCheck className="h-4 w-4" />
                ) : (
                  user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                )}
              </AvatarFallback>
            </Avatar>
            {user.isGuest && (
              <Badge 
                variant="secondary" 
                className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
              >
                G
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                {user.isGuest && (
                  <Badge variant="outline" className="text-xs">
                    {t("guest")}
                  </Badge>
                )}
              </div>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {user.isGuest ? (
            <DropdownMenuItem onClick={() => setShowLoginDialog(true)}>
              <LogIn className="mr-2 h-4 w-4" />
              <span>{t("signIn")}</span>
            </DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>{t("profile")}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t("switchToGuest")}</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="p-0 max-w-md">
          <div className="p-6">
            <LoginForm onClose={() => setShowLoginDialog(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
