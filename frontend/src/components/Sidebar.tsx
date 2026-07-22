import { NavLink } from 'react-router-dom'
import { MessageSquare, Folder, Brain, Wand2, BarChart3, Settings, Plus } from 'lucide-react'

const navItems = [
  { to: '/projects', icon: Folder, label: 'Projects' },
  { to: '/memory', icon: Brain, label: 'Memory' },
  { to: '/skills', icon: Wand2, label: 'Skills' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-warm-100 border-r border-warm-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-warm-200">
        <h1 className="text-xl font-serif font-semibold text-warm-800">
          Maya Chat
        </h1>
        <p className="text-xs text-warm-500 mt-1">Your AI assistant</p>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button className="w-full flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-warm-900 rounded-xl font-medium text-sm transition-colors">
          <Plus size={16} />
          New Chat
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                isActive 
                  ? 'bg-amber-100 text-amber-700 font-medium' 
                  : 'text-warm-600 hover:bg-warm-200 hover:text-warm-800'
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User/Status */}
      <div className="p-3 border-t border-warm-200">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 font-medium text-sm">
            M
          </div>
          <div>
            <div className="text-sm font-medium text-warm-800">Maya</div>
            <div className="text-xs text-warm-500">Free tier</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
