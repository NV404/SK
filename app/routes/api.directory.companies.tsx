import { type LoaderFunctionArgs, json } from "@remix-run/node"
import { desc, eq, ilike } from "drizzle-orm"
import { cacheHeader } from "pretty-cache-header"

import { db, schema } from "@/db/index.server"

export async function loader({ request }: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams
  const rawQuery = searchParams.get("query")

  if (!rawQuery) {
    return json([])
  }

  const query = `%${encodeURIComponent(rawQuery.toLowerCase())}%`

  return json(
    (
      await db
        .select({
          companies: {
            id: schema.companies.id,
            logo: schema.companies.logo,
            name: schema.companies.name,
          },
          companies_metrics: {
            revenue: schema.companies_metrics.revenue,
          },
        })
        .from(schema.companies)
        .leftJoin(
          schema.companies_metrics,
          eq(schema.companies.id, schema.companies_metrics.companyId),
        )
        .where(
          (columns) =>
            // or(
            ilike(schema.companies.name, query),
          // ilike(schema.companies.description, query),
          // ),
        )
        .orderBy((columns) => desc(columns.companies_metrics.revenue))
        .limit(10)
    ).map(({ companies, companies_metrics }) => ({
      id: companies.id,
      logo: companies.logo,
      name: companies.name,
    })),
  )
}
