import { type LucideIcon, Package, Tags } from 'lucide-react'
import { NavLink, Outlet } from 'react-router'
import { paths } from '@/app/paths'
import { cn } from '@/lib/utils'

interface AdminSection {
  to: string
  label: string
  icon: LucideIcon
}

const ADMIN_SECTIONS: AdminSection[] = [
  { to: paths.adminProducts, label: 'Produkty', icon: Package },
  { to: paths.adminCategories, label: 'Kategorie', icon: Tags },
]

export function AdminLayout() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Panel administracyjny</h1>
        <p className="text-sm text-zinc-500">Zarządzanie danymi sklepu zapisanymi w bazie.</p>
      </header>

      <nav
        aria-label="Sekcje panelu"
        className="flex gap-1 overflow-x-auto border-b border-zinc-200"
      >
        {ADMIN_SECTIONS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                '-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'border-zinc-900 text-zinc-900'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900',
              )
            }
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  )
}
