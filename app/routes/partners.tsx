import { LoaderFunctionArgs } from "@remix-run/node"
import { Form, Link, useFetcher, useLoaderData } from "@remix-run/react"
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  FactoryIcon,
  SearchIcon,
  UsersIcon,
} from "lucide-react"
import { useState } from "react"

import { NavbarPublic } from "@/components/layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { SuperCombobox } from "@/components/ui/super-combobox"

import { db } from "@/db/index.server"
import { Grant } from "@/db/schema"

import { FILTERS } from "@/config/options"

import { type loader as companiesLoader } from "./dashboard.api.companies"

export async function loader({ request, params }: LoaderFunctionArgs) {
  const partners = await db.query.partners.findMany()

  return {
    partners,
  }
}

export default function Marketplace() {
  // const fetcher = useFetcher<typeof companiesLoader>()
  const loaderData = useLoaderData<typeof loader>()
  const [sort, setSort] = useState("saaskart")

  return (
    <div className="relative flex min-h-screen flex-col items-stretch gap-8 py-4 sm:py-8">
      <NavbarPublic />

      <div className="container flex gap-3">
        <div className="hidden lg:block">
          <Card>
            <Form
              method="get"
              action="/dashboard/api/companies"
              className="mb-3 max-w-2xl flex-col items-stretch justify-start gap-2 lg:flex"
            >
              {FILTERS ? (
                <>
                  {FILTERS.map((filter) => {
                    console.log(filter, "filter")
                    if (filter.name === "industries") {
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
                          // options={[{ label: "string", value: "string" }]}
                        />
                      )
                    }
                  })}
                </>
              ) : null}
            </Form>
          </Card>
        </div>
        <div className="flex flex-grow flex-col items-stretch justify-start gap-8 px-4">
          <div className="flex flex-col items-stretch justify-start gap-4">
            <div className="w-full border-b border-gray-200 dark:border-gray-800">
              <div className="mx-auto flex w-full flex-col justify-between  gap-2 py-2 md:py-3 lg:flex-row lg:items-center">
                <div className="flex items-center gap-2">
                  <div className="relative flex w-full items-center">
                    <SearchIcon className="absolute inset-0.5 left-0.5 top-1/2 mx-1.5 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <Input
                      className="peer w-full pl-8 lg:w-64"
                      placeholder="Search"
                      type="search"
                    />
                  </div>
                  <Button variant={"hero"}>Search</Button>
                </div>
                <div className="flex items-center gap-2 lg:ml-auto">
                  <Button
                    onClick={() => setSort("saaskart")}
                    className="rounded-full"
                    variant={sort === "saaskart" ? "hero" : "outline"}
                  >
                    SaasKart Pick
                  </Button>
                  <Button
                    onClick={() => setSort("new")}
                    className="rounded-full"
                    variant={sort === "new" ? "hero" : "outline"}
                  >
                    New
                  </Button>
                </div>
              </div>
            </div>
            {loaderData.partners.map((grant) => (
              <div>
                <GrantCard grant={grant} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const GrantCard = ({ grant }: { grant: Grant }) => {
  const [showMore, setMore] = useState(false)
  return (
    <>
      <Card className="w-full rounded-lg border border-gray-200 p-6">
        <CardHeader className="p-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Badge
                variant="secondary"
                className="flex items-center gap-2 bg-green-100"
              >
                <CheckCircle size={15} className=" text-green-500" />
                <p>SaasKart Verified</p>
              </Badge>
              {/* <Link
                to={`/directory/industries/e-commerce-software`}
                className="flex items-center gap-1 text-sm font-semibold opacity-75 hover:underline"
              >
                <FactoryIcon size={15} />
                E-Commerce Software
              </Link> */}
            </div>
            <div className="hidden lg:block">
              <Link to={grant.link as string} target="_blank">
                <Button variant={"hero"}>Learn More</Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 py-2 lg:py-0">
          <div className="flex items-center space-x-4">
            <img
              src={grant.icon as string}
              alt={`logo`}
              width={112}
              className="h-28 w-28 rounded-full border-8 border-white bg-white"
            />
            <div className="flex flex-col justify-between">
              {/* <Link
                to={grant.link as string}
                className="flex items-center gap-1 font-bold hover:underline"
              >
                {grant.from}
              </Link> */}
              <h2 className="text-2xl font-bold">{grant.title}</h2>
              <p className="text-sm text-gray-600">
                {grant.description.slice(0, 280)}...
              </p>
              <div className="py-2 lg:hidden">
                <Link to={grant.link as string} target="_blank">
                  <Button variant={"hero"}>Learn More</Button>
                </Link>
              </div>
              <p
                onClick={() => setMore(!showMore)}
                className="mt-2 flex w-fit cursor-pointer items-center gap-1 text-sm text-green-600 hover:underline"
              >
                Show More Details{" "}
                {showMore ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </p>
            </div>
          </div>
          {showMore && <p className="mt-2">{grant.description}</p>}
        </CardContent>
      </Card>
    </>
  )
}
