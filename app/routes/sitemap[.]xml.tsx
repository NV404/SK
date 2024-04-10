import { cacheHeader } from "pretty-cache-header"

import { db } from "@/db/index.server"

const SITE = "https://www.saaskart.co"

const START = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`
const END = `</urlset>`

function getURLEntry(loc: string) {
  return `<url><loc>${SITE}${loc}</loc></url>`
}

export async function loader() {
  let urls = [START]

  urls.push(getURLEntry(`/`))
  urls.push(getURLEntry(`/directory`))
  urls.push(getURLEntry(`/directory/countries`))
  urls.push(getURLEntry(`/directory/category`))
  urls.push(getURLEntry(`/legal`))

  try {
    const _companies = await db.query.companies.findMany({
      columns: {
        id: true,
        country: true,
        // industryId: true,
      },
    })

    const countries = new Set<string>([])
    const industries = new Set<string>([])

    _companies.forEach((company) => {
      if (company.country) countries.add(company.country)
      // if (company.industryId) industries.add(company.industryId)

      urls.push(getURLEntry(`/companies/${company.id}`))
    })

    countries.forEach(function (country) {
      urls.push(
        getURLEntry(`/directory/countries/${encodeURIComponent(country)}`),
      )
    })
    industries.forEach(function (industry) {
      urls.push(
        getURLEntry(`/directory/category/${encodeURIComponent(industry)}`),
      )
    })
  } catch (error) {
    console.error(
      "Error while fetching posts and searches to generate sitemap.xml!",
      error,
    )
  }

  urls.push(END)

  const content = urls.join("")

  return new Response(content, {
    headers: {
      encoding: "UTF-8",
      "Content-Type": "application/xml",
      "xml-version": "1.0",

      "Cache-Control": cacheHeader({
        public: true,
        maxAge: "12weeks",
        staleWhileRevalidate: "24weeks",
      }),
    },
  })
}
