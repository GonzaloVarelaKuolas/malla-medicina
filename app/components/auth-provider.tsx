"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  isGuest?: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  loginWithAzure: () => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  loginWithAzure: async () => {},
  logout: () => {},
  isLoading: false,
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    } else {
      // Always start with guest mode
      const guestUser: User = {
        id: "guest",
        name: "Guest User",
        email: "guest@local",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=guest",
        isGuest: true,
      }
      setUser(guestUser)
      localStorage.setItem("user", JSON.stringify(guestUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate login - in real app, this would call your auth API
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      const mockUser: User = {
        id: "1",
        name: email.split("@")[0],
        email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        isGuest: false,
      }
      
      setUser(mockUser)
      localStorage.setItem("user", JSON.stringify(mockUser))
    } catch (error) {
      throw new Error("Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithAzure = async () => {
    setIsLoading(true)
    try {
      // Simulate Azure AD login - in real app, this would use MSAL
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      const mockAzureUser: User = {
        id: "azure-user-123",
        name: "Azure User",
        email: "user@company.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=azure",
        isGuest: false,
      }
      
      setUser(mockAzureUser)
      localStorage.setItem("user", JSON.stringify(mockAzureUser))
    } catch (error) {
      throw new Error("Azure login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Always return to guest mode instead of logging out completely
    const guestUser: User = {
      id: "guest",
      name: "Guest User",
      email: "guest@local",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=guest",
      isGuest: true,
    }
    
    setUser(guestUser)
    localStorage.setItem("user", JSON.stringify(guestUser))
  }

  return (
    <AuthContext.Provider value={{ user, login, loginWithAzure, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
