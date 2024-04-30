import {
  type LoaderFunctionArgs,
  type MetaFunction,
  json,
} from "@remix-run/node"
import {
  Form,
  Link,
  useFetcher,
  useLoaderData,
  useParams,
  useSubmit,
} from "@remix-run/react"
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
  Layers2,
  Loader2Icon,
  Search,
  SearchSlash,
  StarHalfIcon,
  StarIcon,
  XCircleIcon,
} from "lucide-react"
import { cacheHeader } from "pretty-cache-header"
import { MutableRefObject, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { SuperCombobox } from "@/components/ui/super-combobox"
import { SuperRangebox } from "@/components/ui/super-rangebox"
import { Tabs } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

import { db, schema } from "@/db/index.server"
import { Company } from "@/db/schema"

import { getMetaTags } from "@/config/meta"
import { FILTERS, LIMIT_OPTIONS, SORT_OPTIONS } from "@/config/options"

import { type loader as companiesLoader } from "./dashboard.api.companies"

export async function loader({ request, params }: LoaderFunctionArgs) {
  const url = new URL(request.url)

  return {
    values: Object.fromEntries(url.searchParams.entries()),
  }
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
  const formRef = useRef(null)
  const startingValues = {
    query: "",
    limit: "10",
    sort: "revenue",
    revenue: "0-0",
    mrr: "4-0",
    valuation: "0-0",
    funding: "0-0",
    customersCount: "0-0",
    teamSize: "0-0",
    industries: "6e632c6f-3fcd-4ab1-b205-832b8b981d43",
  }
  const [defaultValues, setDefaultValues] = useState(startingValues)
  const [shortlist, setShortlist] = useState([])

  const industry = params.slug
  const industryName = loaderData.values?.name

  const fetcher = useFetcher<typeof companiesLoader>()

  const submit = useSubmit()

  function debounce<T extends (...args: any[]) => void>(
    func: T,
    delay: number,
  ) {
    let timeoutId: ReturnType<typeof setTimeout>
    return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
      const context = this
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        func.apply(context, args)
      }, delay)
    }
  }

  function logData(arg: any) {
    // fetcher.submit(formRef.currentTarget)
    console.log(arg, "arg")
    if (arg !== "manual") {
      console.log(arg, "fetcher.formData?.get")
      fetcher.submit(arg, { action: "/dashboard/api/companies" })
    } else {
      fetcher.submit(defaultValues, { action: "/dashboard/api/companies" })
      console.log(defaultValues, "formRef.current")
    }
  }
  const debouncedLogData = debounce(logData, 1000)

  useEffect(() => {
    console.log(defaultValues, "defaultValues")
    if (defaultValues !== startingValues) {
      debouncedLogData("manual")
    }
  }, [defaultValues])

  return (
    <>
      {shortlist.length > 0 ? (
        <div className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-center gap-4 bg-red-300 p-4">
          {shortlist.map((company: any) => (
            <div className="flex items-center gap-2 rounded-lg bg-white p-2">
              <img
                src={company.logo}
                className="h-16 w-16 rounded-full bg-white"
              />
              <div>
                <p className="font-semibold">{company.name}</p>
              </div>
            </div>
          ))}
          <Button
            onClick={() => {
              toast("Add more companies", {
                description: "Add more companies to compare",
              })
            }}
          >
            Compare
          </Button>
          <Dialog>
            <DialogTrigger>
              <Button>Query</Button>
            </DialogTrigger>
            <DialogContent className="flex gap-2">
              <Form method="post" className="flex w-full flex-col gap-3">
                <DialogHeader className="mb-2 text-xl font-bold">
                  <h3 className="text-base/none font-bold sm:text-lg/none md:text-2xl/none">
                    Query form
                  </h3>
                </DialogHeader>
                <div className="flex w-full items-center gap-3">
                  <div className="flex w-full flex-col gap-2">
                    <Label>First Name *</Label>
                    <Input
                      name="firstName"
                      type="text"
                      className="w-full"
                      required
                    ></Input>
                  </div>
                  <div className="flex w-full flex-col gap-2">
                    <Label>Last Name *</Label>
                    <Input
                      name="lastName"
                      type="text"
                      className="w-full"
                      required
                    ></Input>
                  </div>
                </div>
                <div className="flex w-full items-center gap-3">
                  <div className="flex w-full flex-col gap-2">
                    <Label>Your Email *</Label>
                    <Input
                      name="email"
                      type="text"
                      className="w-full"
                      required
                    ></Input>
                  </div>
                  <div className="flex w-full flex-col gap-2">
                    <Label>Phone Number *</Label>
                    <Input
                      name="phonenumber"
                      type="text"
                      className="w-full"
                      required
                    ></Input>
                  </div>
                </div>
                <div className="flex w-full items-center gap-3">
                  <div className="flex w-full flex-col gap-2">
                    <Label>Company Name</Label>
                    <Input
                      name="companyname"
                      type="text"
                      className="w-full"
                    ></Input>
                  </div>
                  <div className="flex w-full flex-col gap-2">
                    <Label>Company Size</Label>
                    <Select name="companysize">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="myself">myself</SelectItem>
                          <SelectItem value="2">2-10</SelectItem>
                          <SelectItem value="11">11-50</SelectItem>
                          <SelectItem value="51">51-200</SelectItem>
                          <SelectItem value="201">201-500</SelectItem>
                          <SelectItem value="501">501-1000</SelectItem>
                          <SelectItem value="1000">1000+</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <div className="flex flex-col gap-2">
                    <Label>Your message *</Label>
                    <Textarea cols={10} required />
                  </div>
                </div>
                <Button variant={"hero"}>Submit</Button>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      ) : null}
      <div className="container flex flex-row flex-wrap items-center justify-start gap-4 px-4">
        {/* <Button asChild variant="outline">
          <Link to="/directory/category">
            <Boxes size={16} className="opacity-50" />
            <span>All Industries</span>
          </Link>
        </Button> */}
      </div>
      <div className="container flex flex-col items-stretch justify-start gap-4 px-4">
        <h1 className="text-2xl font-bold">
          Top {industryName} SaaS companies
        </h1>
      </div>
      <div className="container flex w-full flex-col justify-start px-4 lg:flex-row">
        <fetcher.Form
          method="get"
          action="/dashboard/api/companies"
          ref={formRef}
          className="mb-3 max-w-2xl flex-col items-stretch justify-start gap-2 lg:flex"
          onChange={(e) => {
            const data = Object.fromEntries(
              new FormData(e.currentTarget as HTMLFormElement),
            )

            if (data.query !== undefined && data.query !== data.query) {
              data.query = data.query
            } else {
              // Update other properties
              for (let key in data) {
                if (key !== "query") {
                  data[key] = data[key]!
                }
              }
              // Trigger debounced logging
              debouncedLogData(data)

              // fetcher.submit(e.currentTarget)
            }
          }}
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
            <div className="hidden w-full flex-col items-center justify-start gap-2 lg:flex">
              <SuperCombobox
                name="limit"
                title="Limit"
                icon={HashIcon}
                options={LIMIT_OPTIONS}
                defaultValues={["10"]}
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
                // onValuesChange={(e) => {
                //   console.log(e)
                //   fetcher.submit(formRef.current)
                // }}
                options={SORT_OPTIONS}
                defaultValues={["revenue"]}
                onValuesChange={(e) => {
                  console.log(
                    fetcher.data,
                    "fetcher.data",
                    fetcher.formData?.get("sort"),
                    "sortf",
                    e[0],
                    "and",
                    fetcher?.data && defaultValues.sort !== e[0],
                  )
                  if (fetcher.data && defaultValues.sort !== e[0]) {
                    const temp = { ...defaultValues, sort: e[0] }
                    setDefaultValues(temp)
                  }
                }}
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
                        onValuesChange={() => console.log("hi")}
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

        {!fetcher.data ||
        fetcher.state == "loading" ||
        fetcher.state == "submitting" ? (
          <div className="flex h-96 w-full flex-grow items-center justify-center gap-6 px-0 lg:px-4">
            <Loader2Icon className="animate-spin text-[#ff312b]" />
          </div>
        ) : null}
        {fetcher.data ? (
          fetcher.data.companies?.length === 0 ||
          fetcher.state == "loading" ||
          fetcher.state == "submitting" ? null : (
            <div className="flex flex-grow flex-col items-start justify-start gap-6 px-0 lg:px-4">
              {fetcher.data.companies?.map((company) => (
                <CompanyCard
                  company={company}
                  shortlist={shortlist}
                  setShortlist={setShortlist}
                />
              ))}
            </div>
          )
        ) : null}
      </div>
      {/* <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination> */}
    </>
  )
}

const CompanyCard = ({
  company,
  shortlist,
  setShortlist,
}: {
  company: any
  shortlist: any
  setShortlist: any
}) => {
  const [isThinkTab, setThinkTab] = useState(false)
  // console.log(company, "company details")
  return (
    <Card
      key={company.id}
      className="mx-auto w-full rounded-xl bg-white p-2 shadow-lg dark:bg-gray-800 lg:p-6"
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
                <Link to={`/companies/${company.id}`}>{company.name}</Link>
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
            {shortlist.some((short: any) => short.id === company.id) ? (
              <Button
                variant={"hero"}
                className="flex w-full items-center space-x-1"
                onClick={() => setShortlist([])}
              >
                <Layers2 className="text-white" />
                <span className=" text-white dark:text-gray-400">
                  Shortlisted
                </span>
              </Button>
            ) : (
              <Button
                variant={"outline"}
                className="flex w-full items-center space-x-1"
                onClick={() =>
                  setShortlist([
                    {
                      id: company.id,
                      name: company.name,
                      logo: company.logo,
                    },
                  ])
                }
              >
                <Layers2 className="text-red-500" />
                <span className=" text-gray-600 dark:text-gray-400">
                  Shortlist
                </span>
              </Button>
            )}

            <Button>Try for free</Button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex w-full flex-col items-start gap-2 lg:flex-row lg:items-center">
            {company.claimed_status === "unclaimed" ? (
              <Badge
                variant={"outline"}
                className="flex cursor-pointer items-center gap-x-1.5 text-sm"
              >
                unclamied <XCircleIcon color="red" size={12} />
              </Badge>
            ) : (
              <Badge
                variant={"outline"}
                className="flex w-fit items-center gap-x-1.5 text-sm"
              >
                clamied <CheckCircle color="green" size={12} />
              </Badge>
            )}
            <div className="w-fit rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
              Starting Price: $25.00
            </div>
          </div>
          {/* <Card className="flex gap-1 bg-[#ff312b] px-2 py-1">
            <p className="w-fit text-center text-lg font-black text-white">
              90% Off
            </p>
            <div className="flex flex-col items-center">
              <p className="font-semibold">Only On</p>
              <img
                src="/saaskart_logo.jpg"
                className="filter"
                width={80}
              />
            </div>
          </Card> */}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs>
          <div className="border-b">
            <div className="flex space-x-4 lg:space-x-8">
              <Button
                variant="ghost"
                className={`rounded-none ${
                  !isThinkTab ? "border-b-2 border-primary" : ""
                }`}
                onClick={() => setThinkTab(false)}
              >
                Overview
              </Button>
              {company.saaskartThink ? (
                <Button
                  variant="ghost"
                  className={`rounded-none ${
                    isThinkTab ? "border-b-2 border-primary" : ""
                  }`}
                  onClick={() => setThinkTab(true)}
                >
                  What SaasKart Think
                </Button>
              ) : null}
            </div>
          </div>
          {isThinkTab ? (
            <div className="mt-4">
              <p>{company?.saaskartThink}</p>
            </div>
          ) : (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Product Description
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {company.description}
                {/* <Button className="text-blue-500" variant="ghost">
                Show More
              </Button> */}
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
                  <h4 className="mt-2 text-sm font-semibold">Industries</h4>
                  <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Computer Software</li>
                    <li>• Information Technology and Services</li>
                  </ul>
                </div>
                <div className="hidden lg:block">
                  <BarChartIcon className="text-gray-600" />
                  <h4 className="mt-2 hidden text-sm font-semibold lg:block">
                    Market Segment
                  </h4>
                  <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• 46% Mid-Market</li>
                    <li>• 33% Enterprise</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
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
}
