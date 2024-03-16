import {
  type LoaderFunctionArgs,
  type MetaFunction,
  json,
} from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { cacheHeader } from "pretty-cache-header"

import { Button } from "@/components/ui/button"

import { db } from "@/db/index.server"
import { companies } from "@/db/schema"

import { getMetaTags } from "@/config/meta"

export async function loader({ request }: LoaderFunctionArgs) {
  return json(
    (
      await db
        .selectDistinctOn([companies.country], {
          country: companies.country,
        })
        .from(companies)
        .orderBy(companies.country)
    ).map((row) => row.country),
    {
      headers: {
        "Cache-Control": cacheHeader({
          public: true,
          maxAge: "12weeks",
          staleWhileRevalidate: "24weeks",
        }),
      },
    },
  )
}

export const meta: MetaFunction = () => {
  return [
    ...getMetaTags({
      title: ["All Countries", "Directory"],
      description: `List of all countries in the directory of top SaaS companies.`,
    }),
  ]
}

export default function DirectoryCountriesHome() {
  const loaderData = useLoaderData<typeof loader>()

  return (
    <>
      <div className="container flex flex-col items-stretch justify-start gap-4 px-4">
        <h1 className="text-2xl font-bold">All Countries</h1>
      </div>
      <div className="container flex flex-row flex-wrap items-center justify-start gap-4 px-4">
        {loaderData.map((country) => (
          <Button key={country} asChild variant="outline" size="sm">
            <Link to={`./${country}`}>{country}</Link>
          </Button>
        ))}
      </div>
    </>
  )
}
