import { type MetaFunction } from "@remix-run/node"
import { Link, Outlet } from "@remix-run/react"
import { ArrowLeft, ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"

import { getMetaTags } from "@/config/meta"

export const meta: MetaFunction = () => {
  return [
    ...getMetaTags({
      title: ["Directory"],
      description:
        "Search & explore the directory of 30k+ SaaS companies across the industries from around the world.",
    }),
  ]
}

export default function DirectoryLayout() {
  return (
    <div className="relative flex min-h-screen flex-col items-stretch gap-8 overflow-y-auto overflow-x-hidden py-4 sm:py-8">
      <div className="container flex flex-row flex-wrap items-center justify-start gap-4 px-4">
        <Button asChild>
          <Link to="/">
            <ArrowLeft size={16} className="opacity-50" />
            <span>Back home</span>
          </Link>
        </Button>
        <Link
          to="/directory"
          className="flex flex-row items-center justify-start gap-2"
        >
          <ChevronLeft size={20} className="opacity-50" />
          <img src="/logo.svg" alt="logo" width={20} height={20} />
          <span className="text-xl/none font-bold">SaaSData</span>
          <p className="text-xl/none font-medium opacity-75">Directory</p>
        </Link>
      </div>

      <Outlet />
    </div>
  )
}
