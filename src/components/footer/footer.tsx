"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const t = useTranslations('NavbarLinks');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  return (
    <footer className="bg-[#f0fafa] py-10 px-2">
      <div className="mx-10 flex flex-col md:flex-row justify-between gap-10">
        {/* Logo & Social */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
             <Link href={`/${locale}/`} className="flex items-center gap-2">
              <Image src="/logo.svg" alt="Vonders Logo" width={32} height={32} />
              <span className="text-xl font-bold text-gray-900">Vonders</span>
            </Link>
          </div>
          <p className="text-gray-500 text-sm max-w-xs">
            Copyright © {currentYear} Vonders. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Image src="/facebook.svg" alt="Facebook" width={24} height={24} />
            <Image src="/instagram.svg" alt="Instagram" width={24} height={24} />
            <Image src="/twitter.svg" alt="Vonders Logo" width={24} height={24} />
          </div>
          <div className="flex gap-3 mt-2">
            <Link href="#" className="text-[#4ad4e4] hover:text-[#37c0d0] transition">
              <i className="fab fa-facebook-f"></i>
            </Link>
            <Link href="#" className="text-[#4ad4e4] hover:text-[#37c0d0] transition">
              <i className="fab fa-linkedin-in"></i>
            </Link>
            <Link href="#" className="text-[#4ad4e4] hover:text-[#37c0d0] transition">
              <i className="fab fa-twitter"></i>
            </Link>
          </div>
        </div>

        {/* Links Sections */}
        <div className="flex flex-wrap gap-10">
          {/* Linkes */}
          <div>
            <h3 className="text-gray-900 font-bold mb-4">Linkes</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li><Link href="#">Home</Link></li>
              <li><Link href="#">Episodes</Link></li>
              <li><Link href="#">Trending</Link></li>
              <li><Link href="#">Category</Link></li>
              <li><Link href="#">Blog</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-gray-900 font-bold mb-4">Features</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li><Link href="#">Style guide</Link></li>
              <li><Link href="#">Instructions</Link></li>
              <li><Link href="#">Catelog</Link></li>
              <li><Link href="#">Your podcast</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-gray-900 font-bold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li><Link href="#">Privacy</Link></li>
              <li><Link href="#">Terms</Link></li>
              <li><Link href="#">Security</Link></li>
              <li><Link href="#">Cookies</Link></li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="flex flex-col gap-3 justify-center align-items-center">
          <h3 className="text-gray-900 font-bold mb-4 text-center">Sign up for our newsletter</h3>
          <form className="flex rounded-full border border-gray-300 overflow-hidden bg-white">
            <input
              type="email"
              placeholder="Your Email Address"
              className="px-4 py-2 text-sm outline-none flex-1"
            />
            <button
              type="submit"
              title="Submit"
              className="bg-[#4ad4e4] hover:bg-[#37c0d0] text-white px-4 flex items-center justify-center transition"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </footer>
  );
}
