import {
  type LoaderFunctionArgs,
  type MetaFunction,
  json,
} from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { cacheHeader } from "pretty-cache-header"

import { Button } from "@/components/ui/button"

import { db } from "@/db/index.server"

import { getMetaTags } from "@/config/meta"

export async function loader({ request }: LoaderFunctionArgs) {
  return json(await db.query.categories.findMany(), {
    headers: {
      "Cache-Control": cacheHeader({
        public: true,
        maxAge: "12weeks",
        staleWhileRevalidate: "24weeks",
      }),
    },
  })
}

export const meta: MetaFunction = () => {
  return [
    ...getMetaTags({
      title: ["All Industries", "Directory"],
      description: `List of all industries in the directory of top SaaS companies.`,
    }),
  ]
}

export default function DirectoryIndustriesHome() {
  const loaderData = useLoaderData<typeof loader>()

  return (
    <>
      <div className="container flex flex-col items-stretch justify-start gap-4 px-4">
        <h1 className="text-2xl font-bold">All Industries</h1>
      </div>
      <div className="container flex flex-row flex-wrap items-center justify-start gap-4 px-4">
        {loaderData.map((industry) => (
          <Button key={industry.id} asChild variant="outline" size="sm">
            <Link key={industry.id} to={`./${industry.id}`}>
              {industry.name}
            </Link>
          </Button>
        ))}
      </div>
    </>
  )
}
