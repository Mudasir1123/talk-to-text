"use client"

export interface User {
  id: number
  email: string
  name: string
  isAdmin: boolean
}

export class AuthService {
  private static instance: AuthService
  private user: User | null = null

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        this.user = data.user
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        return { success: true, user: data.user }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: "Network error occurred" }
    }
  }

  async signup(
    name: string,
    email: string,
    password: string,
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        this.user = data.user
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        return { success: true, user: data.user }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: "Network error occurred" }
    }
  }

  logout(): void {
    this.user = null
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }

  getCurrentUser(): User | null {
    if (this.user) return this.user

    const userData = localStorage.getItem("user")
    if (userData) {
      this.user = JSON.parse(userData)
      return this.user
    }

    return null
  }

  getToken(): string | null {
    return localStorage.getItem("token")
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null && this.getToken() !== null
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser()
    return user?.isAdmin || false
  }
}

export const authService = AuthService.getInstance()
