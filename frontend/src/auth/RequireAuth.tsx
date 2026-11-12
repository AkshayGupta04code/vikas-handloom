import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

/** role="ADMIN" restricts to admins; otherwise any logged-in user (customer or admin) is allowed. */
export default function RequireAuth({ role }: { role?: 'ADMIN' }) {
  const { session } = useAuth()
  const loc = useLocation()
  if (!session) return <Navigate to="/login" replace state={{ from: loc.pathname + loc.search }} />
  if (role && session.role !== role) return <Navigate to="/" replace />
  return <Outlet />
}