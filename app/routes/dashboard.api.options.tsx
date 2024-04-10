import { type LoaderFunctionArgs, json } from "@remix-run/node"
import { isNotNull, max, min } from "drizzle-orm"
import { cacheHeader } from "pretty-cache-header"

import { db, schema } from "@/db/index.server"

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const searchParams = url.searchParams

  const name = searchParams.get("name")

  let response = null

  if (!name) {
    response = {
      error: "Name is required!",
    }
  }

  if (name === "countries") {
    response = (
      await db
        .selectDistinct({ country: schema.companies.country })
        .from(schema.companies)
        .where(isNotNull(schema.companies.country))
        .orderBy(schema.companies.country)
    ).map(({ country }) => ({
      value: country,
      label: country,
    }))
  }

  if (name === "industries") {
    response = await db
      .selectDistinct({
        value: schema.categories.id,
        label: schema.categories.name,
      })
      .from(schema.categories)
  }

  if (
    name === "revenue" ||
    name === "mrr" ||
    name === "valuation" ||
    name === "funding" ||
    name === "customersCount" ||
    name === "teamSize"
  ) {
    const column = schema.companies_metrics[name]

    const [rangeConfig] = await db
      .select({
        min: min(column),
        max: max(column),
      })
      .from(schema.companies_metrics)

    response = {
      min: Math.floor(Number(rangeConfig.min)),
      max: Math.ceil(Number(rangeConfig.max)),
    }
  }

  return json(response, {
    headers: {
      "Cache-Control": cacheHeader({
        private: true,
        maxAge: "1weeks",
        staleWhileRevalidate: "2weeks",
      }),
    },
  })
}
