"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import { Globe, Menu, X, Home, MapPin, MessageSquare, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const Navbar = ({ locale }: { locale: string }) => {
  const t = useTranslations("NavbarLinks")
  const pathName = usePathname()
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLanguageChange = (selectedLocale: string) => {
    const path = pathName.split("/").slice(2).join("/")
    router.push(`/${selectedLocale}/${path}`)
  }

  const isActive = (path: string) => {
    return pathName === `/${locale}${path}`
  }

  const navLinks = [
    { href: "/", label: t("Places"), icon: <MapPin className="h-4 w-4 mr-2" /> },
    { href: "/things", label: t("Things"), icon: <Home className="h-4 w-4 mr-2" /> },
    { href: "/forum", label: t("Forum"), icon: <MessageSquare className="h-4 w-4 mr-2" /> },
  ]

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link
            href={`/${locale}/`}
            className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent"
          >
            Vonders
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={`/${locale}${link.href}`}
              className={cn(
                "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
                isActive(link.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/10",
              )}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side items */}
        <div className="flex items-center space-x-2">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Globe className="h-5 w-5" />
                <span className="sr-only">Switch language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleLanguageChange("en")}
                className={cn("cursor-pointer", locale === "en" && "bg-primary/10 text-primary")}
              >
                English
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLanguageChange("vi")}
                className={cn("cursor-pointer", locale === "vi" && "bg-primary/10 text-primary")}
              >
                Tiếng Việt
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Auth Button */}
          {isAuthenticated ? (
            <Button variant="ghost" size="sm" className="flex items-center gap-2" asChild>
              <Link href={`/${locale}/profile`}>
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user?.name || t("profile")}</span>
              </Link>
            </Button>
          ) : (
            <Button variant="default" size="sm" asChild>
              <Link href={`/${locale}/auth/login`}>{t("login")}</Link>
            </Button>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t py-4 px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={`/${locale}${link.href}`}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/10",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  )
}

export default Navbar

