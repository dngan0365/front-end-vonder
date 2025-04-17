'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import "@/app/globals.css";

import {
  Atom,
  Globe,
  Menu,
  X,
  Home,
  MapPin,
  MessageSquare,
  User
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import { Button } from '@/components/ui/button';
import styles from './navbar.module.css';

const Navbar = () => {
  const t = useTranslations('NavbarLinks');
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const locale = pathname.split('/')[1] || 'en';
  const pathWithoutLocale = pathname.split('/').slice(2).join('/') || '';

  const handleLanguageChange = (selectedLocale: string) => {
    router.push(`/${selectedLocale}/${pathWithoutLocale}`);
  };

  const isActive = (path: string) => pathname === `/${locale}${path}`;

  const navLinks = [
    {
      href: '/',
      label: t('Places'),
      icon: <MapPin className="h-6 w-6 mr-2" />
    },
    {
      href: '/things',
      label: t('Things'),
      icon: <Home className="h-6 w-6 mr-2" />
    },
    {
      href: '/forum',
      label: t('Forum'),
      icon: <MessageSquare className="h-6 w-6 mr-2" />
    },
    {
      href: '/map',
      label: t('Map'),
      icon: <Atom className="h-6 w-6 mr-2" />
    }
  ];

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
        <nav className="hidden md:flex items-center space-x-1 ">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={`/${locale}${link.href}`}
              className={cn(
                'group flex items-center px-4 py-5 text-sm font-medium transition-colors',
                isActive(link.href)
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-[#77DAE6]/10 hover:text-[#4ad4e4]'
              )}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center space-x-2">
          {/* Language Switch */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="p-2 w-14 h-14">
                <Globe className="h-10 w-10" />
                <span className="sr-only">Switch language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {['en', 'vi'].map((lang) => (
                <DropdownMenuItem
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={cn(
                    'cursor-pointer',
                    locale === lang && 'bg-primary/10 text-primary'
                  )}
                >
                  {lang === 'en' ? 'English' : 'Tiếng Việt'}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Auth Buttons */}
          {isAuthenticated ? (
            <Button variant="ghost" size="sm" className="flex px-6 py-4 rounded-[50px] items-center gap-2" asChild>
              <Link href={`/${locale}/profile`}>
                <User className="h-8 w-8" />
              </Link>
            </Button>
          ) : (
            <>
          <Button size="lg" className="bg-[#4ad4e4] px-6 py-4 rounded-[50px] text-white hover:bg-[#77DAE6]" asChild>
            <Link href={`/${locale}/auth/register`}>
              {t('register')}
            </Link>
          </Button>


            <Button variant="outline" size="lg"
            className="px-6 py-4 rounded-[50px] text-base font-semibold text-primary border-[#4ad4e4] hover:bg-[#77DAE6]/10" asChild>
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
