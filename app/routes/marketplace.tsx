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
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { SuperCombobox } from "@/components/ui/super-combobox"

import { FILTERS } from "@/config/options"

import { type loader as companiesLoader } from "./dashboard.api.companies"

export default function Marketplace() {
  const fetcher = useFetcher<typeof companiesLoader>()
  const [sort, setSort] = useState("saaskart")

  return (
    <div className="relative flex min-h-screen flex-col items-stretch gap-8 py-4 sm:py-8">
      <NavbarPublic />

      <div className="container flex items-center gap-3 px-4 lg:px-0">
        <section className="hidden w-full lg:block">
          <div className="mx-auto flex w-full items-center justify-between rounded-2xl bg-gradient-to-br from-[#ff312b] to-violet-400 p-6 text-white sm:p-6">
            <div className="flex flex-col gap-4">
              <div className="">
                <span className="text-gray-100">
                  Epicor Software Corporation
                </span>
                <br />
                <span className=" text-3xl font-semibold text-white">
                  Upto 90% Off Everyday
                </span>
              </div>
              <a
                href=""
                target="_blank"
                rel="noreferrer"
                className="ease group flex w-fit items-center gap-1 rounded-lg  bg-white px-4 py-2 text-black duration-300 hover:bg-gray-50"
              >
                <span>Grab now</span>
                <svg
                  data-v-e660a7a7=""
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  role="img"
                  className="ease transition-transform duration-200 group-hover:translate-x-1"
                  width="1em"
                  height="1em"
                  viewBox="0 0 256 256"
                >
                  <path
                    fill="currentColor"
                    d="m221.66 133.66l-72 72a8 8 0 0 1-11.32-11.32L196.69 136H40a8 8 0 0 1 0-16h156.69l-58.35-58.34a8 8 0 0 1 11.32-11.32l72 72a8 8 0 0 1 0 11.32Z"
                  ></path>
                </svg>
              </a>
            </div>
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-20 w-20 text-gray-100"
                viewBox="0 0 15 15"
              >
                <path
                  fill="currentColor"
                  fill-rule="evenodd"
                  d="M4.5 0A2.5 2.5 0 0 0 2 2.5v.286c0 .448.133.865.362 1.214H1.5A1.5 1.5 0 0 0 0 5.5v1A1.5 1.5 0 0 0 1.5 8H7V4h1v4h5.5A1.5 1.5 0 0 0 15 6.5v-1A1.5 1.5 0 0 0 13.5 4h-.862c.229-.349.362-.766.362-1.214V2.5A2.5 2.5 0 0 0 10.5 0c-1.273 0-2.388.68-3 1.696A3.498 3.498 0 0 0 4.5 0ZM8 4h2.786C11.456 4 12 3.456 12 2.786V2.5A1.5 1.5 0 0 0 10.5 1A2.5 2.5 0 0 0 8 3.5V4ZM7 4H4.214C3.544 4 3 3.456 3 2.786V2.5A1.5 1.5 0 0 1 4.5 1A2.5 2.5 0 0 1 7 3.5V4Z"
                  clip-rule="evenodd"
                ></path>
                <path
                  fill="currentColor"
                  d="M7 9H1v3.5A2.5 2.5 0 0 0 3.5 15H7V9Zm1 6h3.5a2.5 2.5 0 0 0 2.5-2.5V9H8v6Z"
                ></path>
              </svg>
            </div>
          </div>
        </section>
        <section className="w-full">
          <div className="mx-auto flex w-full items-center justify-between rounded-2xl bg-gradient-to-br from-[#ff312b] to-violet-400 p-6 text-white sm:p-6">
            <div className="flex flex-col gap-4">
              <div className="">
                <span className="text-gray-100">
                  Epicor Software Corporation
                </span>
                <br />
                <span className=" text-3xl font-semibold text-white">
                  Upto 90% Off Everyday
                </span>
              </div>
              <a
                href=""
                target="_blank"
                rel="noreferrer"
                className="ease group flex w-fit items-center gap-1 rounded-lg  bg-white px-4 py-2 text-black duration-300 hover:bg-gray-50"
              >
                <span>Grab now</span>
                <svg
                  data-v-e660a7a7=""
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  role="img"
                  className="ease transition-transform duration-200 group-hover:translate-x-1"
                  width="1em"
                  height="1em"
                  viewBox="0 0 256 256"
                >
                  <path
                    fill="currentColor"
                    d="m221.66 133.66l-72 72a8 8 0 0 1-11.32-11.32L196.69 136H40a8 8 0 0 1 0-16h156.69l-58.35-58.34a8 8 0 0 1 11.32-11.32l72 72a8 8 0 0 1 0 11.32Z"
                  ></path>
                </svg>
              </a>
            </div>
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-20 w-20 text-gray-100"
                viewBox="0 0 15 15"
              >
                <path
                  fill="currentColor"
                  fill-rule="evenodd"
                  d="M4.5 0A2.5 2.5 0 0 0 2 2.5v.286c0 .448.133.865.362 1.214H1.5A1.5 1.5 0 0 0 0 5.5v1A1.5 1.5 0 0 0 1.5 8H7V4h1v4h5.5A1.5 1.5 0 0 0 15 6.5v-1A1.5 1.5 0 0 0 13.5 4h-.862c.229-.349.362-.766.362-1.214V2.5A2.5 2.5 0 0 0 10.5 0c-1.273 0-2.388.68-3 1.696A3.498 3.498 0 0 0 4.5 0ZM8 4h2.786C11.456 4 12 3.456 12 2.786V2.5A1.5 1.5 0 0 0 10.5 1A2.5 2.5 0 0 0 8 3.5V4ZM7 4H4.214C3.544 4 3 3.456 3 2.786V2.5A1.5 1.5 0 0 1 4.5 1A2.5 2.5 0 0 1 7 3.5V4Z"
                  clip-rule="evenodd"
                ></path>
                <path
                  fill="currentColor"
                  d="M7 9H1v3.5A2.5 2.5 0 0 0 3.5 15H7V9Zm1 6h3.5a2.5 2.5 0 0 0 2.5-2.5V9H8v6Z"
                ></path>
              </svg>
            </div>
          </div>
        </section>
      </div>

      <div className="container flex gap-3">
        <div className="hidden lg:block">
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
            <OfferCard />
            <OfferCard isCoupon={true} />
          </div>
        </div>
      </div>
    </div>
  )
}

const OfferCard = ({ isCoupon = false }: { isCoupon?: boolean }) => {
  const [showMore, setMore] = useState(false)
  const [isCouponOpen, setCouponOpen] = useState(false)
  return (
    <>
      <Dialog open={isCouponOpen} onOpenChange={setCouponOpen}>
        <DialogContent className=" gap-2 rounded-lg bg-gradient-to-br from-[#563dc4] to-[#ff312b] px-20 py-10 text-center text-white shadow-md">
          <img
            src="https://lnasrdywxzbwlgabwale.supabase.co/storage/v1/object/public/saasdata/logos/epicor-software-corporation.png"
            className="mx-auto mb-4 w-20 rounded-lg"
          />
          <h3 className="mb-4 text-2xl font-semibold">Upto 90% Off Everyday</h3>
          <div className="mb-6 flex items-center justify-center space-x-2">
            <span
              id="cpnCode"
              className="rounded-l border border-dashed px-4 py-2 text-white"
            >
              STEALDEAL20
            </span>
            <span
              id="cpnBtn"
              className="cursor-pointer rounded-r border border-white bg-white px-4 py-2 font-bold text-[#ff312b]"
            >
              Copy Code
            </span>
          </div>
          <p className="text-sm">
            Valid Till: <span className=" font-semibold">20Dec, 2021</span>
          </p>

          <div className="absolute left-0 top-1/2 -ml-6 h-12 w-12 -translate-y-1/2 transform rounded-full bg-white"></div>
          <div className="absolute right-0 top-1/2 -mr-6 h-12 w-12 -translate-y-1/2 transform rounded-full bg-white"></div>
        </DialogContent>
      </Dialog>
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
                to={`/directory/industries/e-commerce-software`}
                className="flex items-center gap-1 text-sm font-semibold opacity-75 hover:underline"
              >
                <FactoryIcon size={15} />
                E-Commerce Software
              </Link>
            </div>
            <div className="hidden lg:block">
              {isCoupon ? (
                <Button variant={"hero"} onClick={() => setCouponOpen(true)}>
                  Revel Offer Code
                </Button>
              ) : (
                <Button variant={"hero"}>Get Deal</Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 py-2 lg:py-0">
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
                to={`/companies/epicor-software-corporation`}
                className="flex items-center gap-1 font-bold hover:underline"
              >
                Epicor Software Corporation
              </Link>
              <h2 className="text-2xl font-bold">Upto 90% Off Everyday</h2>
              <p className="text-sm text-gray-600">
                Save Upto 90% On Select Products Every Hour
              </p>
              <div className="py-2 lg:hidden">
                {isCoupon ? (
                  <Button variant={"hero"} onClick={() => setCouponOpen(true)}>
                    Revel Offer Code
                  </Button>
                ) : (
                  <Button variant={"hero"}>Get Deal</Button>
                )}
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
          {showMore && (
            <p className="mt-2">
              Epicor Software Corporation offers a remarkable opportunity with
              its ongoing promotion. Customers can enjoy significant savings of
              up to 90% on selected products throughout the day. With hourly
              rotations of discounted items, there's always something new to
              discover and save on. Don't miss out on the chance to enjoy
              incredible discounts on quality products, every hour, every day."
            </p>
          )}
        </CardContent>
      </Card>
    </>
  )
}
