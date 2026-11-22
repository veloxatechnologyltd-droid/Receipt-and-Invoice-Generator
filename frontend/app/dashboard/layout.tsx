'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { isAuthenticated, getCurrentUser } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'
import './dashboard.css'
import './premium-ui.css'

const WIDE_ROUTES = ['/dashboard/receipt', '/dashboard/invoice']

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    const loadUser = async () => {
      try {
        const userData = await getCurrentUser()
        setUser(userData)
      } catch (err) {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router])

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
      </div>
    )
  }

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} />
      <main className={`dashboard-content${WIDE_ROUTES.includes(pathname) ? ' dashboard-content--wide' : ''}`}>
        {children}
      </main>
    </div>
  )
}
