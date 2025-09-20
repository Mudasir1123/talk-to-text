"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  Menu, 
  X, 
  Mic, 
  LogOut, 
  User, 
  Home,
  Info,
  Mail,
  LayoutDashboard,
  Upload,
  History,
  ChevronDown,
  Bell
} from "lucide-react"
import { authService, type User as UserType } from "../lib/auth"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = authService.getCurrentUser()
      const isAuth = authService.isAuthenticated()

      setIsLoggedIn(isAuth)
      setUser(currentUser)
    }

    checkAuth()

    // Listen for storage changes to update auth state across tabs
    const handleStorageChange = () => {
      checkAuth()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const handleLogout = () => {
    authService.logout()
    setIsLoggedIn(false)
    setUser(null)
    setShowUserMenu(false)
    router.push("/")
  }

  // Get display name - prioritize full name over email
  const getDisplayName = () => {
    if (user?.name && user.name.trim()) {
      return user.name
    }
    return user?.email?.split('@')[0] || 'User'
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    const name = getDisplayName()
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  return (
    <nav className="fixed top-0 w-full z-50 nav-dark border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center glow transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
              <Mic className="w-5 h-5 text-white transition-all duration-300 group-hover:animate-pulse" />
            </div>
            <span className="text-xl font-bold gradient-text transition-all duration-300 group-hover:scale-105 hidden sm:block">
              TalkToText Pro
            </span>
            <span className="text-lg font-bold gradient-text transition-all duration-300 group-hover:scale-105 sm:hidden">
              TTP
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/" className="nav-link px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 group transition-all duration-300 hover:scale-105">
                <Home className="w-4 h-4 transition-all duration-300 group-hover:text-primary" />
                <span>Home</span>
              </Link>
              <Link href="/about" className="nav-link px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 group transition-all duration-300 hover:scale-105">
                <Info className="w-4 h-4 transition-all duration-300 group-hover:text-primary" />
                <span>About</span>
              </Link>
              <Link href="/contact" className="nav-link px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 group transition-all duration-300 hover:scale-105">
                <Mail className="w-4 h-4 transition-all duration-300 group-hover:text-primary" />
                <span>Contact</span>
              </Link>
              {isLoggedIn && (
                <>
                  <Link href="/dashboard" className="nav-link px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 group transition-all duration-300 hover:scale-105">
                    <LayoutDashboard className="w-4 h-4 transition-all duration-300 group-hover:text-accent" />
                    <span>Dashboard</span>
                  </Link>
                  <Link href="/upload" className="nav-link px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 group transition-all duration-300 hover:scale-105">
                    <Upload className="w-4 h-4 transition-all duration-300 group-hover:text-accent" />
                    <span>Upload</span>
                  </Link>
                  <Link href="/history" className="nav-link px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 group transition-all duration-300 hover:scale-105">
                    <History className="w-4 h-4 transition-all duration-300 group-hover:text-accent" />
                    <span>History</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-3">
                {/* Notification Bell */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative glass-button text-white hover:bg-white/10 transition-all duration-300 hover:scale-110"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                </Button>

                {/* User Menu */}
                <div className="relative">
                  <Button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    variant="ghost"
                    size="sm"
                    className="glass-button text-white hover:bg-white/10 flex items-center space-x-2 transition-all duration-300 hover:scale-105"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-xs font-bold text-white transition-all duration-300 hover:shadow-lg">
                      {getUserInitials()}
                    </div>
                    <span className="max-w-24 truncate font-medium">{getDisplayName()}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                  </Button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 glass-card rounded-lg shadow-xl border border-white/10 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-white/10">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-sm font-bold text-white">
                            {getUserInitials()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{getDisplayName()}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="py-1">
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors duration-200 flex items-center space-x-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="glass-button bg-transparent text-white border-white/30 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    size="sm"
                    className="glass-button bg-primary/20 border-primary/30 hover:bg-primary/30 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg animate-pulse"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              onClick={() => setIsOpen(!isOpen)} 
              variant="ghost" 
              size="sm" 
              className="glass-button text-white transition-all duration-300 hover:scale-110"
            >
              {isOpen ? 
                <X className="w-5 h-5 transition-all duration-300 rotate-90" /> : 
                <Menu className="w-5 h-5 transition-all duration-300" />
              }
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden glass-card-light border-t border-white/10 animate-in slide-in-from-top-2 duration-300">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              href="/" 
              className="nav-link block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2 transition-all duration-300 hover:translate-x-2"
              onClick={() => setIsOpen(false)}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <Link 
              href="/about" 
              className="nav-link block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2 transition-all duration-300 hover:translate-x-2"
              onClick={() => setIsOpen(false)}
            >
              <Info className="w-4 h-4" />
              <span>About</span>
            </Link>
            <Link 
              href="/contact" 
              className="nav-link block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2 transition-all duration-300 hover:translate-x-2"
              onClick={() => setIsOpen(false)}
            >
              <Mail className="w-4 h-4" />
              <span>Contact</span>
            </Link>
            {isLoggedIn && (
              <>
                <Link 
                  href="/dashboard" 
                  className="nav-link block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2 transition-all duration-300 hover:translate-x-2"
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link 
                  href="/upload" 
                  className="nav-link block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2 transition-all duration-300 hover:translate-x-2"
                  onClick={() => setIsOpen(false)}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload</span>
                </Link>
                <Link 
                  href="/history" 
                  className="nav-link block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2 transition-all duration-300 hover:translate-x-2"
                  onClick={() => setIsOpen(false)}
                >
                  <History className="w-4 h-4" />
                  <span>History</span>
                </Link>
              </>
            )}
            
            <div className="pt-4 pb-3 border-t border-white/10">
              {isLoggedIn ? (
                <div className="space-y-3">
                  {/* Mobile User Profile Section */}
                  <div className="relative">
                    <div 
                      className="flex items-center px-3 py-2 space-x-3 cursor-pointer transition-all duration-300 hover:bg-white/10 rounded-md"
                      onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-sm font-bold text-white">
                        {getUserInitials()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{getDisplayName()}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                    </div>
                    
                    {/* Mobile User Dropdown */}
                    {showUserMenu && (
                      <div className="mt-2 mx-3 glass-card rounded-lg border border-white/10 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full glass-button text-white hover:bg-white/10 justify-start transition-all duration-300 hover:translate-x-2"
                        >
                          <Bell className="w-4 h-4 mr-2" />
                          Notifications
                          <span className="ml-auto w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                        </Button>
                        
                        <Button
                          onClick={handleLogout}
                          variant="ghost"
                          size="sm"
                          className="w-full glass-button border-red-500/30 text-red-400 hover:bg-red-500/20 bg-transparent transition-all duration-300 justify-start"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link href="/login" className="block" onClick={() => setIsOpen(false)}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full glass-button bg-transparent text-white border-white/30 hover:bg-white/10 transition-all duration-300 hover:scale-105"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" className="block" onClick={() => setIsOpen(false)}>
                    <Button
                      size="sm"
                      className="w-full glass-button bg-primary/20 border-primary/30 hover:bg-primary/30 text-white transition-all duration-300 hover:scale-105"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}