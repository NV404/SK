import { type LoaderFunctionArgs, json } from "@remix-run/node"
import { type SQL, and, between, eq, ilike, inArray } from "drizzle-orm"
import { cacheHeader } from "pretty-cache-header"

import { asc, desc } from "@/lib/drizzle.server"
import { getRangeConfigFromValue, searchParamsToObject } from "@/lib/utils"

import { db, schema } from "@/db/index.server"
import {
  type Company,
  type CompanyMetrics,
  type CompanySocials,
  type Industry,
} from "@/db/schema"

import { FILTERS_CONST, type SORT_OPTIONS_CONST } from "@/config/options"

const parts = [
  {
    type: "text",
    name: "query",
  },
  ...FILTERS_CONST.map((filter) => ({
    type: filter.type,
    name: filter.name,
  })),
  {
    type: "combobox",
    name: "sort",
  },
] as const

function maybeArrayToArray(input: string | string[]) {
  return typeof input === "object" ? input : [input]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const searchParams = url.searchParams

  const formDataObject = searchParamsToObject(searchParams) as Record<
    (typeof parts)[number]["name"] | "limit",
    string | string[]
  >

  const conditions: (SQL | undefined)[] = []
  const metricsConditions: (SQL | undefined)[] = []

  parts.forEach((part) => {
    if (part.name === "query") {
      const value = formDataObject[part.name] as string
      if (!value) return

      const query = `%${encodeURIComponent(value.toLowerCase())}%`

      conditions.push(
        // or(
        ilike(schema.companies.name, query),
        // ilike(schema.companies.description, query),
        // ),
      )
    } else if (part.name === "countries") {
      let value = formDataObject[part.name]
      if (!value) return

      value = maybeArrayToArray(value)

      conditions.push(inArray(schema.companies.country, value))
    } else if (part.name === "industries") {
      let value = formDataObject[part.name]
      if (!value) return

      value = maybeArrayToArray(value)

      conditions.push(inArray(schema.companies.industryId, value))
    } else if (
      part.name === "revenue" ||
      part.name === "mrr" ||
      part.name === "valuation" ||
      part.name === "funding" ||
      part.name === "customersCount" ||
      part.name === "teamSize"
    ) {
      const value = formDataObject[part.name] as string
      if (!value) return

      const config = getRangeConfigFromValue(value)
      if (!config) return

      metricsConditions.push(
        between(
          schema.companies_metrics[part.name],
          config.min.toString(),
          config.max.toString(),
        ),
      )
    }
  })

  const query = db
    .select()
    .from(schema.companies)
    .leftJoin(
      schema.companies_socials,
      eq(schema.companies.id, schema.companies_socials.companyId),
    )
    .leftJoin(
      schema.industries,
      eq(schema.companies.industryId, schema.industries.id),
    )
    .leftJoin(
      schema.companies_metrics,
      eq(schema.companies.id, schema.companies_metrics.companyId),
    )
    .where((columns) => {
      return and(...conditions, ...metricsConditions)
    })
    .orderBy((columns) => {
      const sortValue = formDataObject[
        "sort"
      ] as string as (typeof SORT_OPTIONS_CONST)[number]["value"]

      if (sortValue === "countries") {
        return asc(schema.companies.country)
      }

      if (sortValue === "industries") {
        return asc(schema.industries.name)
      }

      if (
        sortValue === "revenue" ||
        sortValue === "mrr" ||
        sortValue === "valuation" ||
        sortValue === "funding" ||
        sortValue === "customersCount" ||
        sortValue === "teamSize"
      ) {
        return desc(schema.companies_metrics[sortValue])
      }

      return asc(schema.companies.name)
    })
    .limit(Number(formDataObject["limit"]))

  const companies: (Company & {
    socials: CompanySocials | null
    industry: Industry | null
    metrics: CompanyMetrics | null
    founders: {
      id: string
      personalEmail: string | null
      email: string | null
    }[]
  })[] = []

  for (const row of await query) {
    companies.push({
      ...row.companies,
      socials: row.companies_socials,
      industry: row.industries,
      metrics: row.companies_metrics,
      founders: await db.query.founders.findMany({
        columns: {
          id: true,
          personalEmail: true,
          email: true,
        },
        where: () =>
          // and(
          eq(schema.founders.companyId, row.companies.id),
        // eq(schema.founders.isCeo, true),
        // ),
      }),
    })
  }

  return json(
    {
      companies,
    },
    {
      headers: {
        "Cache-Control": cacheHeader({
          private: true,
          maxAge: "1weeks",
          staleWhileRevalidate: "2weeks",
        }),
      },
    },
  )
}
