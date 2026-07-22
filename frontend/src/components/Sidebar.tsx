import { NavLink } from 'react-router-dom'
import { MessageSquare, Folder, Brain, Wand2, BarChart3, Settings } from 'lucide-react'

const navItems = [
  { to: '/', icon: MessageSquare, label: 'Chat' },
  { to: '/projects', icon: Folder, label: 'Projects' },
  { to: '/memory', icon: Brain, label: 'Memory' },
  { to: '/skills', icon: Wand2, label: 'Skills' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-purple-400">Maya Chat</h1>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
