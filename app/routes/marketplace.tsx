import { Link, useFetcher } from "@remix-run/react"
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
import { Input } from "@/components/ui/input"
import { SuperCombobox } from "@/components/ui/super-combobox"

import { FILTERS } from "@/config/options"

import { type loader as companiesLoader } from "./dashboard.api.companies"

export default function Marketplace() {
  const fetcher = useFetcher<typeof companiesLoader>()

  return (
    <div className="relative flex min-h-screen flex-col items-stretch gap-8 py-4 sm:py-8">
      <NavbarPublic />

      <div className="container flex gap-3">
        <div>
          <Card>
            <fetcher.Form
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
                        />
                      )
                    }
                  })}
                </>
              ) : null}
            </fetcher.Form>
          </Card>
        </div>
        <div className="flex flex-grow flex-col items-stretch justify-start gap-8 px-4">
          <div className="flex flex-col items-stretch justify-start gap-4">
            <div className="w-full border-b border-gray-200 dark:border-gray-800">
              <div className="mx-auto flex w-full items-center justify-between py-2 md:py-3">
                <div className="flex items-center">
                  <div className="relative flex items-center">
                    <SearchIcon className="absolute inset-0.5 left-0.5 top-1/2 mx-1.5 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <Input
                      className="peer w-64 pl-8"
                      placeholder="Search"
                      type="search"
                    />
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Button className="rounded-full" variant="hero">
                    SaasKart Pick
                  </Button>
                  <Button className="rounded-full" variant="outline">
                    New
                  </Button>
                </div>
              </div>
            </div>
            <OfferCard />
          </div>
        </div>
      </div>
    </div>
  )
}

const OfferCard = () => {
  const [showMore, setMore] = useState(false)
  return (
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
            <Link
              to={`/directory/industries/some`}
              className="flex items-center gap-1 text-sm font-semibold opacity-75 hover:underline"
            >
              <FactoryIcon size={15} />
              E-Commerce Software
            </Link>
          </div>
          <Button variant={"hero"}>Get Deal</Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex items-center space-x-4">
          <img
            src={
              "https://lnasrdywxzbwlgabwale.supabase.co/storage/v1/object/public/saasdata/logos/epicor-software-corporation.png"
            }
            alt={`logo`}
            width={112}
            className="h-28 w-28 rounded-full border-8 border-white bg-white"
          />
          <div className="flex flex-col justify-between">
            <Link
              to={`/directory/industries/some`}
              className="flex items-center gap-1 font-bold hover:underline"
            >
              Epicor Software Corporation
            </Link>
            <h2 className="text-2xl font-bold">Upto 90% Off Everyday</h2>
            <p className="text-sm text-gray-600">
              Save Upto 90% On Select Products Every Hour
            </p>
            <p
              onClick={() => setMore(!showMore)}
              className="mt-2 flex w-fit cursor-pointer items-center gap-1 text-sm text-green-600 hover:underline"
            >
              Show More Details{" "}
              {showMore ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </p>
          </div>
        </div>
        {showMore && (
          <p className="mt-2">
            Epicor Software Corporation offers a remarkable opportunity with its
            ongoing promotion. Customers can enjoy significant savings of up to
            90% on selected products throughout the day. With hourly rotations
            of discounted items, there's always something new to discover and
            save on. Don't miss out on the chance to enjoy incredible discounts
            on quality products, every hour, every day."
          </p>
        )}
      </CardContent>
    </Card>
  )
}
