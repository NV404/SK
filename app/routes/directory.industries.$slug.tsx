import {
  type LoaderFunctionArgs,
  type MetaFunction,
  json,
} from "@remix-run/node"
import { Link, useFetcher, useLoaderData, useParams } from "@remix-run/react"
import { and, desc, eq, isNotNull } from "drizzle-orm"
import {
  ArrowUpDown,
  BarChartIcon,
  Boxes,
  BuildingIcon,
  CheckCircle,
  CheckCircleIcon,
  EyeIcon,
  Filter,
  GroupIcon,
  HashIcon,
  HeartIcon,
  Search,
  SearchSlash,
  StarHalfIcon,
  StarIcon,
} from "lucide-react"
import { cacheHeader } from "pretty-cache-header"
import { MutableRefObject, useEffect, useRef } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SuperCombobox } from "@/components/ui/super-combobox"
import { SuperRangebox } from "@/components/ui/super-rangebox"
import { Tabs } from "@/components/ui/tabs"

import { db, schema } from "@/db/index.server"

import { getMetaTags } from "@/config/meta"
import { FILTERS, LIMIT_OPTIONS, SORT_OPTIONS } from "@/config/options"

import { type loader as companiesLoader } from "./dashboard.api.companies"

export async function loader({ request, params }: LoaderFunctionArgs) {
  const industryId = params.slug ?? ""

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
            eq(columns.companies.industryId, industryId),
            isNotNull(columns.companies_metrics.revenue),
          ),
        )
        .limit(10)
        .orderBy((columns) => desc(columns.companies_metrics.revenue))
    ).map(({ companies, companies_metrics }) => ({
      id: companies.id,
      logo: companies.logo,
      name: companies.name,
    })),
    // {
    //   headers: {
    //     "Cache-Control": cacheHeader({
    //       public: true,
    //       maxAge: "12weeks",
    //       staleWhileRevalidate: "24weeks",
    //     }),
    //   },
    // },
  )
}

export const meta: MetaFunction = ({ params }) => {
  const industry = params.slug

  return [
    ...getMetaTags({
      title: [`Top ${industry} SaaS companies `, "Directory"],
      description: `List of top SaaS companies in the ${industry} industry in the directory.`,
    }),
  ]
}

export default function DirectoryIndustriesIndustry() {
  const loaderData = useLoaderData<typeof loader>()
  const params = useParams()

  const industry = params.slug
  const fetcher = useFetcher<typeof companiesLoader>()

  return (
    <>
      <div className="container flex flex-row flex-wrap items-center justify-start gap-4 px-4">
        {/* <Button asChild variant="outline">
          <Link to="/directory/industries">
            <Boxes size={16} className="opacity-50" />
            <span>All Industries</span>
          </Link>
        </Button> */}
      </div>
      <div className="container flex flex-col items-stretch justify-start gap-4 px-4">
        <h1 className="text-2xl font-bold">Top {industry} SaaS companies</h1>
      </div>
      <div className="container flex w-full flex-col justify-start px-4 lg:flex-row">
        <fetcher.Form
          method="get"
          action="/dashboard/api/companies"
          className=" hidden max-w-2xl flex-col items-stretch justify-start gap-2 lg:flex"
        >
          <fieldset className="contents" disabled={fetcher.state !== "idle"}>
            <div className="flex w-full flex-col items-center justify-between gap-2">
              <Input
                type="search"
                name="query"
                placeholder="Query by company name or description..."
                autoComplete="off"
              />
              <Button type="submit" variant="hero" className="w-full">
                <Search size={16} />
                <span>Search</span>
              </Button>
            </div>
            <div className="flex w-full flex-col items-center justify-start gap-2">
              <SuperCombobox
                name="limit"
                title="Limit"
                icon={HashIcon}
                options={LIMIT_OPTIONS}
                defaultValues={["25"]}
                multiple={false}
                required
                showTitle={false}
                isHidden={true}
                triggerButtonProps={{
                  size: "xs",
                }}
              />
              {/* {activeFilterValues.length ? (
            ) : null}

            {activeFilterValues.map((activeFilterValue) => {
              const filter = FILTERS.find(
                (_filter) => _filter.name === activeFilterValue,
              ) */}
              <SuperCombobox
                name="sort"
                title="Sort by"
                icon={ArrowUpDown}
                multiple={false}
                required
                options={SORT_OPTIONS}
                defaultValues={["revenue"]}
                triggerButtonProps={{
                  size: "xs",
                }}
              />
              <Separator className="my-4" />
              {FILTERS ? (
                <>
                  {FILTERS.map((filter) => {
                    if (filter.type === "range") {
                      return (
                        <SuperRangebox
                          key={filter.name}
                          name={filter.name}
                          title={filter.title}
                          icon={filter.icon}
                          fetch={filter.url}
                          triggerButtonProps={{
                            size: "xs",
                          }}
                        />
                      )
                    }

                    if (filter.name === "industries") {
                      return (
                        <SuperCombobox
                          key={filter.name}
                          name={filter.name}
                          title={filter.title}
                          icon={filter.icon}
                          defaultValues={[industry as string]}
                          fetch={filter.url}
                          isHidden={true}
                          triggerButtonProps={{
                            size: "xs",
                          }}
                        />
                      )
                    }

                    return (
                      <SuperCombobox
                        key={filter.name}
                        name={filter.name}
                        title={filter.title}
                        icon={filter.icon}
                        fetch={filter.url}
                        triggerButtonProps={{
                          size: "xs",
                        }}
                      />
                    )
                  })}
                </>
              ) : null}
            </div>
          </fieldset>
        </fetcher.Form>

        {!fetcher.data ? (
          <div className="flex flex-grow flex-col items-start justify-start gap-6 px-4">
            {loaderData.map((company) => (
              <Card
                key={company.id}
                className="mx-auto w-full rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800"
              >
                <CardHeader>
                  <div className="flex flex-col items-start justify-between gap-2 lg:flex-row">
                    <div className="flex items-start gap-3">
                      <Link to={`/companies/${company.id}`}>
                        <img
                          alt="Salesforce logo"
                          className="min-h-20 min-w-20 mr-4 rounded-lg"
                          height="80"
                          src={company.logo as string}
                          style={{
                            aspectRatio: "80/80",
                            objectFit: "cover",
                          }}
                          width="80"
                        />
                      </Link>
                      <div className="flex flex-col gap-2">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                          <Link to={`/companies/${company.id}`}>
                            {company.name}
                          </Link>
                        </h2>
                        <div className="flex flex-col lg:flex-row lg:items-center">
                          <div className="flex">
                            <StarIcon className="text-yellow-400" />
                            <StarIcon className="text-yellow-400" />
                            <StarIcon className="text-yellow-400" />
                            <StarIcon className="text-yellow-400" />
                            <StarHalfIcon className="text-yellow-400" />
                          </div>
                          <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                            4.3 out of 5
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-end gap-2 lg:flex-col">
                      <Button
                        variant={"outline"}
                        className="flex w-full items-center space-x-2"
                      >
                        <HeartIcon className="text-red-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Save
                        </span>
                      </Button>
                      <Button>Try for free</Button>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={"outline"}
                        className="flex w-fit items-center gap-x-1.5 text-sm"
                      >
                        clamied <CheckCircle color="green" size={12} />
                      </Badge>
                      <div className="w-fit rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
                        Starting Price: $25.00
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <EyeIcon className="text-blue-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        View top Consulting Services for {company.name}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs>
                    <div className="border-b">
                      <div className="flex space-x-4 lg:space-x-8">
                        <Button variant="ghost" className="rounded-none">
                          Overview
                        </Button>
                        <Button variant="ghost" className="rounded-none">
                          What SaasKart Think
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Product Description
                      </h3>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Salesforce Sales Cloud is the complete platform for
                        Salesblazers, our community of sellers, sales leaders,
                        and sales operations professionals, to grow sales and
                        increase productivity. With the #1 AI ...
                        <Button className="text-blue-500" variant="ghost">
                          Show More
                        </Button>
                      </p>
                      <div className="mt-4 grid grid-cols-3 gap-4">
                        <div>
                          <GroupIcon className="text-gray-600" />
                          <h4 className="mt-2 text-sm font-semibold">Users</h4>
                          <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            <li>• Account Executive</li>
                            <li>• Account Manager</li>
                          </ul>
                        </div>
                        <div>
                          <BuildingIcon className="text-gray-600" />
                          <h4 className="mt-2 text-sm font-semibold">
                            Industries
                          </h4>
                          <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            <li>• Computer Software</li>
                            <li>• Information Technology and Services</li>
                          </ul>
                        </div>
                        <div>
                          <BarChartIcon className="text-gray-600" />
                          <h4 className="mt-2 text-sm font-semibold">
                            Market Segment
                          </h4>
                          <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            <li>• 46% Mid-Market</li>
                            <li>• 33% Enterprise</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Tabs>
                </CardContent>
                {/* <CardFooter>
            <Checkbox id="compare" />
            <Label className="ml-2 text-gray-600 dark:text-gray-400" htmlFor="compare">
              Compare
            </Label>
          </CardFooter> */}
              </Card>
            ))}
          </div>
        ) : null}
        {fetcher.data ? (
          fetcher.data.companies?.length === 0 ? null : (
            <div className="flex flex-grow flex-col items-start justify-start gap-6 px-4">
              {fetcher.data.companies?.map((company) => {
                return (
                  <Card
                    key={company.id}
                    className="mx-auto w-full rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800"
                  >
                    <CardHeader>
                      <div className="flex flex-col items-start justify-between gap-2 lg:flex-row">
                        <div className="flex items-start gap-3">
                          <Link to={`/companies/${company.id}`}>
                            <img
                              alt="Salesforce logo"
                              className="min-h-20 min-w-20 mr-4 rounded-lg"
                              height="80"
                              src={company.logo as string}
                              style={{
                                aspectRatio: "80/80",
                                objectFit: "cover",
                              }}
                              width="80"
                            />
                          </Link>
                          <div className="flex flex-col gap-2">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                              <Link to={`/companies/${company.id}`}>
                                {company.name}
                              </Link>
                            </h2>
                            <div className="flex flex-col lg:flex-row lg:items-center">
                              <div className="flex">
                                <StarIcon className="text-yellow-400" />
                                <StarIcon className="text-yellow-400" />
                                <StarIcon className="text-yellow-400" />
                                <StarIcon className="text-yellow-400" />
                                <StarHalfIcon className="text-yellow-400" />
                              </div>
                              <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                4.3 out of 5
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-end gap-2 lg:flex-col">
                          <Button
                            variant={"outline"}
                            className="flex w-full items-center space-x-2"
                          >
                            <HeartIcon className="text-red-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Save
                            </span>
                          </Button>
                          <Button>Try for free</Button>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={"outline"}
                            className="flex w-fit items-center gap-x-1.5 text-sm"
                          >
                            clamied <CheckCircle color="green" size={12} />
                          </Badge>
                          <div className="w-fit rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
                            Starting Price: $25.00
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <EyeIcon className="text-blue-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            View top Consulting Services for {company.name}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Tabs>
                        <div className="border-b">
                          <div className="flex space-x-4 lg:space-x-8">
                            <Button variant="ghost" className="rounded-none">
                              Overview
                            </Button>
                            <Button variant="ghost" className="rounded-none">
                              What SaasKart Think
                            </Button>
                          </div>
                        </div>
                        <div className="mt-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Product Description
                          </h3>
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Salesforce Sales Cloud is the complete platform for
                            Salesblazers, our community of sellers, sales
                            leaders, and sales operations professionals, to grow
                            sales and increase productivity. With the #1 AI ...
                            <Button className="text-blue-500" variant="ghost">
                              Show More
                            </Button>
                          </p>
                          <div className="mt-4 grid grid-cols-3 gap-4">
                            <div>
                              <GroupIcon className="text-gray-600" />
                              <h4 className="mt-2 text-sm font-semibold">
                                Users
                              </h4>
                              <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                <li>• Account Executive</li>
                                <li>• Account Manager</li>
                              </ul>
                            </div>
                            <div>
                              <BuildingIcon className="text-gray-600" />
                              <h4 className="mt-2 text-sm font-semibold">
                                Industries
                              </h4>
                              <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                <li>• Computer Software</li>
                                <li>• Information Technology and Services</li>
                              </ul>
                            </div>
                            <div>
                              <BarChartIcon className="text-gray-600" />
                              <h4 className="mt-2 text-sm font-semibold">
                                Market Segment
                              </h4>
                              <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                <li>• 46% Mid-Market</li>
                                <li>• 33% Enterprise</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </Tabs>
                    </CardContent>
                    {/* <CardFooter>
            <Checkbox id="compare" />
            <Label className="ml-2 text-gray-600 dark:text-gray-400" htmlFor="compare">
              Compare
            </Label>
          </CardFooter> */}
                  </Card>
                )
              })}
            </div>
          )
        ) : null}
      </div>
    </>
  )
}
