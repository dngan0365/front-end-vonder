'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  PenSquare, 
  Bookmark, 
  Search, 
  Gamepad2, 
  UserCircle,
  Table2
} from 'lucide-react'

export default function ForumLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navItems = [
    { name: 'Forum', href: '/forum', icon: <Home size={20} /> },
    { name: 'Create', href: '/forum/create', icon: <PenSquare size={20} /> },
    { name: 'Saved', href: '/forum/saved', icon: <Bookmark size={20} /> },
    { name: 'Search', href: '/forum/search', icon: <Search size={20} /> },
    { name: 'Game', href: '/forum/game', icon: <Gamepad2 size={20} /> },
    { name: 'Profile', href: '/forum/profile', icon: <UserCircle size={20} /> },
  ]

  return (
    <div className="flex flex-1">
      {/* Sidebar */}
      <aside className={`sticky top-16 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-gray-800 h-[calc(100vh-65px)] flex flex-col ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          {!isCollapsed && <h2 className="text-xl font-bold">Forum</h2>}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-md hover:bg-[#77DAE6]/8 hover:text-[#4ad4e4] dark:hover:bg-slate-800"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <Table2 className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto pt-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item, index) => (
              <li key={index}>
                <Link 
                  href={item.href}
                  className={`flex items-center p-2 rounded-md hover:bg-[#77DAE6]/8 hover:text-[#4ad4e4] dark:hover:bg-slate-800 ${
                    pathname.includes(item.href) ? 'bg-[#77DAE6]/10 text-[#4ad4e4] dark:bg-slate-800 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          {!isCollapsed && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Vietnam Tours Forum
            </p>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
