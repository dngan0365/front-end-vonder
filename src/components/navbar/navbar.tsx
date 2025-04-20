'use client';
// Authentication
import { useAuth } from "@/context/AuthContext"
// Translage Language
import { usePathname, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
// Others
import { useState} from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Luggage, Map , LogOut, Bot, Globe, Menu, X, MapPin, MessageSquare, User, Bell } from "lucide-react"
import { DropdownMenuItem, HoverableDropdown } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import Image from "next/image"

import style from "./navbar.module.css"

const Navbar = () => {
  const pathName = usePathname()
  const locale = pathName.split('/')[1];
  const t = useTranslations("Navbar");
  const router = useRouter()
  const { isAuthenticated, user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const pathWithoutLocale = pathName.replace(`/${locale}`, '');

  const handleLanguageChange = (selectedLocale: string) => {
    router.push(`/${selectedLocale}${pathWithoutLocale}`);
  };

  const isActive = (path: string) => pathName === `/${locale}${path}`;

  const navLinks = [
    {
      href: '/explore',
      label: t('explore'),
      icon: <MapPin className="h-6 w-6" />
    },
    {
      href: '/travel',
      label: t('travel'),
      icon: <Luggage className="h-6 w-6" />
    },
    {
      href: '/forum',
      label: t('forum'),
      icon: <MessageSquare className="h-6 w-6" />
    },
    {
      href: '/map',
      label: t('map'),
      icon: <Map className="h-6 w-6" />
    }
  ];

  // Notification
  const notificationCount = 3;
  const handleLogout = () => {
    logout();
    router.push(`/`);
  };

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 px-4 md:px-10 items-center justify-between">
        {/* Logo */}

        <Link
          href={`/${locale}/`}
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <Image
            src="/logo.svg"
            alt="Vonders Logo"
            width={40}
            height={40}
          />
          <span className="text-xl font-semibold">Vonders</span>
        </Link>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={`/${locale}${link.href}`}
              className={cn(
                'group flex items-center px-4 py-5 text-sm font-medium transition-colors',
                isActive(link.href)
                  ? 'bg-[#77DAE6]/5 text-[#4ad4e4]'
                  : 'hover:bg-[#77DAE6]/5 hover:text-[#4ad4e4]'
              )}
            >
              {link.icon}
              <span className={`hidden ${style.title}`}>{link.label}</span>
              </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center">
          {/* Language Switch */}
          <HoverableDropdown
            trigger={
              <button className={cn("px-4 py-5 transition-colors")}>
                <Globe className="h-6 w-6" />
                <span className="sr-only">Switch language</span>
              </button>
            }
            align="end"
          >
            {['en', 'vi'].map((lang) => (
              <DropdownMenuItem
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={cn(
                  'cursor-pointer',
                  locale === lang && 'bg-[#77DAE6]/10 text-[#4ad4e4]'
                )}
              >
                {lang === 'en' ? t("en") : t("vi")}
              </DropdownMenuItem>
            ))}
          </HoverableDropdown>

          {/* Auth Buttons */}
          {isAuthenticated ? (
          <>
            <button className="relative px-4 py-5 hover:bg-[#77DAE6]/10 hover:text-[#4ad4e4]">
              <Bell className="h-6 w-6" />
              {notificationCount > 0 && (
                <span className="absolute top-2 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {notificationCount}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </button>

            <HoverableDropdown
            trigger={
                    <button className="px-4 py-5">
                      <Link href={`/${locale}/profile`}>
                        {user?.image ? (
                          <div className="relative h-6 w-6 rounded-full overflow-hidden">
                            <Image 
                              src={user.image} 
                              alt={user.name || "Profile"} 
                              fill 
                              sizes="30px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <User className="h-6 w-6" />
                        )}
                      </Link>
                    </button>
            }
            align="end"
          >
            {user?.role === 'ADMIN' && 
              <DropdownMenuItem>
                  <Link href={`/${locale}/admin`}>
                    {t('admin')}
                  </Link>
              </DropdownMenuItem>
              }
              <DropdownMenuItem>
                  <Link href={`/${locale}/chatbot`} className="flex w-full items-center justify-between">
                        <span>{t('chatbot')}</span>
                        <Bot className="h-4 w-4"/>
                  </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                  <Link href={`/${locale}/profile`}>{t('profile')}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                  <Link href={`/${locale}/settings`}>{t('settings')}</Link>
              </DropdownMenuItem>
              <hr/>
              <DropdownMenuItem>
                  <button className="flex w-full items-center justify-between" onClick={handleLogout}>
                    <span>{t('logout')}</span>
                    <LogOut className="h-4 w-4" />
                  </button>
              </DropdownMenuItem>
          </HoverableDropdown>
          </>
          ) : (
            <>
          <Button size="lg" className="bg-[#4ad4e4] px-6 py-4 rounded-[50px] text-white hover:bg-[#77DAE6]" asChild>
            <Link href={`/${locale}/auth/register`}>
              {t('register')}
            </Link>
          </Button>


            <Button variant="outline" size="lg"
            className="px-6 py-4 rounded-[50px] border-[#4ad4e4] hover:bg-[#77DAE6]/10" asChild>
              <Link href={`/${locale}/auth/login`}>
                {t('login')}
              </Link>
            </Button>
            </>
          )}

          {/* Mobile Toggle */}
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

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden border-t py-4 px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={`/${locale}${link.href}`}
                className={cn(
                  'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive(link.href)
                    ? 'bg-primary/10 text-custom-primary'
                    : 'hover:text-primary hover:bg-custom-primary/10'
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
  );
};

export default Navbar;
