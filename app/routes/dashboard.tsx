import { type LoaderFunctionArgs, redirect } from "@remix-run/node"
import { Outlet } from "@remix-run/react"

import { NavbarDashboard } from "@/components/layout"

import { getUserId } from "@/lib/session.server"

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request)

  if (!userId) {
    return redirect("/")
  }

  return null
}

export default function Dashboard() {
  return (
    <div className="relative flex min-h-screen flex-col items-stretch gap-8 overflow-x-hidden py-4 sm:py-8">
      <NavbarDashboard />

      <Outlet />
    </div>
  )
}
