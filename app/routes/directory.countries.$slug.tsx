import {
  type LoaderFunctionArgs,
  type MetaFunction,
  json,
} from "@remix-run/node"
import { Link, useLoaderData, useParams } from "@remix-run/react"
import { and, desc, eq, isNotNull } from "drizzle-orm"
import { MapPinned } from "lucide-react"
import { cacheHeader } from "pretty-cache-header"

import { Button } from "@/components/ui/button"

import { db, schema } from "@/db/index.server"

import { getMetaTags } from "@/config/meta"

export async function loader({ request, params }: LoaderFunctionArgs) {
  const country = params.slug ?? ""

  return json(
    (
      await db
        .select()
        .from(schema.companies)
        .leftJoin(
          schema.companies_metrics,
          eq(schema.companies.id, schema.companies_metrics.companyId),
        )
        .where((columns) =>
          and(
            eq(columns.companies.country, country),
            isNotNull(columns.companies_metrics.revenue),
          ),
        )
        .orderBy((columns) => desc(columns.companies_metrics.revenue))
        .limit(1000)
    ).map(({ companies, companies_metrics }) => ({
      id: companies.id,
      logo: companies.logo,
      name: companies.name,
    })),
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

export const meta: MetaFunction = ({ params }) => {
  const country = params.slug

  return [
    ...getMetaTags({
      title: [`Top ${country} SaaS companies `, "Directory"],
      description: `List of top SaaS companies from ${country} in the directory.`,
    }),
  ]
}

export default function DirectoryCountriesCountry() {
  const loaderData = useLoaderData<typeof loader>()
  const params = useParams()

  const country = params.slug

  return (
    <>
      <div className="container flex flex-row flex-wrap items-center justify-start gap-4 px-4">
        <Button asChild variant="outline">
          <Link to="/directory/countries">
            <MapPinned size={16} className="opacity-50" />
            <span>All Countries</span>
          </Link>
        </Button>
      </div>
      <div className="container flex flex-col items-stretch justify-start gap-4 px-4">
        <h1 className="text-2xl font-bold">Top {country} SaaS companies</h1>
      </div>
      <div className="container flex flex-col items-start justify-start gap-4 px-4">
        {loaderData.map((company) => (
          <Button key={company.id} asChild variant="link" size="sm" noPadding>
            <Link to={`/companies/${company.id}`}>
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={`${company.name} logo`}
                  width={16}
                  height={16}
                />
              ) : null}
              <span>{company.name}</span>
            </Link>
          </Button>
        ))}
      </div>
    </>
  )
}
