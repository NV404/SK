import {
  ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
  type SerializeFrom,
  redirect,
} from "@remix-run/node"
import {
  Form,
  Link,
  useActionData,
  useFetcher,
  useLoaderData,
} from "@remix-run/react"
import { format } from "date-fns"
import { count, eq } from "drizzle-orm"
import {
  Banknote,
  Boxes,
  CalendarClock,
  CalendarIcon,
  CheckCircle,
  CheckCircleIcon,
  CheckIcon,
  ChevronRightIcon,
  CircleOff,
  Coins,
  EditIcon,
  FactoryIcon,
  Gem,
  HeartHandshake,
  LinkIcon,
  Linkedin,
  type LucideIcon,
  PiggyBank,
  Rocket,
  StarIcon,
  TrendingDown,
  TrendingUp,
  Twitter,
  Users2,
  XCircleIcon,
  Youtube,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Carousel } from "react-responsive-carousel"
import "react-responsive-carousel/lib/styles/carousel.min.css"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts"
import { type action as authenticationAction } from "~/routes/api.authentication"

// import { type action as authenticationAction } from "~/routes/api.authentication"
import { Footer, NavbarDashboard, NavbarPublic } from "@/components/layout"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

import { getUser } from "@/lib/session.server"
import { cn, formatNumber, getRandom, groupBy } from "@/lib/utils"

import { db, type schema } from "@/db/index.server"
import { claims, companiesUpdate, companyReviews, users } from "@/db/schema"

import { getMetaTags } from "@/config/meta"
import { FILTERS } from "@/config/options"

export async function loader({ request, params }: LoaderFunctionArgs) {
  const slug = params.slug as any

  let company = await db.query.companies.findFirst({
    where: (company, { eq }) => eq(company.id, slug),
    with: {
      socials: {
        columns: {
          crunchbase: false,
          facebook: false,
          website: false,
        },
      },
      // industry: true,
      metrics: true,
      metricsHistory: true,
      fundingHistory: true,
      pricings: true,
      update: true,
      compinesToCategories: {
        with: {
          category: true,
        },
      },
    },
  })

  if (!company) {
    return redirect("/")
  }

  const competitors = (
    await db.query.competitors.findMany({
      with: {
        competitor: {
          columns: {
            id: true,
            name: true,
            logo: true,
          },
          with: {
            compinesToCategories: true,
          },
        },
      },
      where: (company, { eq }) => eq(company.companyId, slug),
      limit: 10,
    })
  ).map((row) => row.competitor)

  const user = await getUser(request, false)
  const userId = user ? user?.id : "b6a942b3-8f11-4a0d-b9cc-182f1f3585bd"
  // let getClaimStatus
  const getClaimStatus = await db.query.claims.findFirst({
    where: (claims, { eq, and }) =>
      and(eq(claims.companyId, slug), eq(claims.userId, userId)),
  })

  return {
    user,
    company: {
      ...company,
      competitors,
    },
    claimStatus: getClaimStatus ? true : false,
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData()
  const action = form.get("action")
  const companyId = form.get("companyId") as string

  if (action === "claim") {
    const number = form.get("phonenumber") as string
    const linkedin = form.get("linkedin") as string

    const user = await getUser(request)

    if (!user) {
      return null
    }

    if (user.linkedinLink !== linkedin || user.phoneNumber !== number) {
      const [updatedUser] = await db
        .update(users)
        .set({
          ...(user.linkedinLink !== linkedin ? { linkedinLink: linkedin } : {}),
          ...(user.phoneNumber !== number ? { phoneNumber: number } : {}),
        })
        .where(eq(users.id, user.id))
    }
    const [claim] = await db
      .insert(claims)
      .values({ userId: user.id, companyId: companyId })
      .returning()

    if (claim) {
      return { data: "success" }
    }
  }

  // TODO : action for adding query
  if (action === "query") {
  }

  if (action === "edit") {
    const name = form.get("name") as string

    const [companiesEdit] = await db
      .select()
      .from(companiesUpdate)
      .where(eq(companiesUpdate.companyId, companyId))

    console.log(companiesEdit, "companiesEdit")

    if (companiesEdit) {
      await db
        .update(companiesUpdate)
        .set({
          ...(name && name !== "" ? { name: name } : {}),
        })
        .where(eq(companiesUpdate.companyId, companyId))
    } else {
      await db.insert(companiesUpdate).values({
        companyId: companyId,
        ...(name && name !== "" ? { name: name } : {}),
        // ...(Description && Description != "" ? {description: description} : {}),
      })
    }

    return { success: true }
  }

  return null
}

function getCompanyDescription({ company }: SerializeFrom<typeof loader>) {
  return `${company.name} is a company based in ${
    company.country
  }. It was founded in ${company.yearOfIncorporation}${
    company.metrics?.revenue
      ? ` and currently does ${formatNumber(
          Number(company.metrics.revenue),
          true,
        )} of revenue.`
      : "."
  }${
    company.metrics?.teamSize
      ? ` It now has a team size of ${formatNumber(
          Number(company.metrics.teamSize),
        )}.`
      : ""
  }`
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return []

  return [
    ...getMetaTags({
      title: [data.company.name],
      description: getCompanyDescription(data),
    }),
  ]
}

export default function Company() {
  const loaderData = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const isAuthenticated = loaderData.user
  const company = loaderData.company
  const user = loaderData.user

  const authenticationFetcher = useFetcher<typeof authenticationAction>({
    key: "authentication",
  })

  const fundingHistoryChartData = useMemo(
    () =>
      company.fundingHistory
        .map((row) => ({
          capturedAt: new Date(row.capturedAt).getFullYear(),
          funding: row.funding,
          valuation: row.valuation,
        }))
        .sort((rowA, rowB) => rowA.capturedAt - rowB.capturedAt),
    [company.fundingHistory],
  )
  const metricsHistoryGrouped = useMemo(
    () => groupBy(company.metricsHistory, "name"),
    [company.metricsHistory],
  )
  const metricsHistoryChartPossible = useMemo(
    () =>
      Object.keys(metricsHistoryGrouped).filter(
        (key) =>
          metricsHistoryGrouped[key].length > 1 &&
          (
            [
              "acv",
              "arpu",
              "cac",
              "customersCount",
              "mrr",
              "nrr",
              "dbc",
              "funding",
              "grossChurn",
              "revenue",
              "revenuePerEmployee",
              "teamSize",
              "valuation",
            ] as (keyof schema.CompanyMetrics)[]
          ).includes(key as keyof schema.CompanyMetrics),
      ),
    [metricsHistoryGrouped],
  )

  const [selectedMetricsHistoryChart, setSelectedMetricsHistoryChart] =
    useState(metricsHistoryChartPossible[0])

  const metricsHistoryChartData = useMemo(
    () =>
      metricsHistoryGrouped[selectedMetricsHistoryChart]
        ?.map((row) => ({
          capturedAt: new Date(row.capturedAt).getFullYear(),
          value: row.value,
        }))
        .sort((rowA, rowB) => rowA.capturedAt - rowB.capturedAt),
    [metricsHistoryGrouped, selectedMetricsHistoryChart],
  )

  var settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    initialSlide: 0,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  }

  const [contactForm, setForm] = useState(false)
  const [valuesCount, setValuesCount] = useState(0)
  const [valuation, setValuation] = useState(0)
  const [teamSize, setTeamSize] = useState(0)
  const [date, setDate] = useState<Date>()
  // const authenticationFetcher = useFetcher<typeof authenticationAction>({
  //   key: "authentication",
  // })

  return (
    <div className="relative flex min-h-screen flex-col items-stretch gap-8 py-4 sm:py-8">
      <Dialog open={contactForm} onOpenChange={setForm}>
        <DialogContent className="max-h-[85%] w-[40rem] max-w-none gap-2 overflow-y-scroll">
          <div className="mt-4 flex w-full flex-col gap-3">
            <div className="flex w-full flex-col gap-2">
              <div className="flex flex-row items-center justify-between gap-4">
                <div className="h-px flex-1 rounded-full bg-border"></div>
                <h3 className="text-base/none font-bold sm:text-lg/none md:text-xl/none">
                  FAQ
                </h3>
                <div className="h-px flex-1 rounded-full bg-border"></div>
              </div>
            </div>
          </div>
          <div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-4">
                {[...Array(3)].map((index, idx) => (
                  <div className="flex flex-col space-y-2" key={idx}>
                    <Label>FAQ {idx + 1}</Label>
                    <div>
                      <Label>Question</Label>
                      <Input type="text" />
                    </div>
                    <div>
                      <Label>Answer</Label>
                      <Textarea rows={3} />
                    </div>
                  </div>
                ))}
              </div>
              <Button
                variant={"outline"}
                onClick={() => setValuesCount(valuesCount + 1)}
              >
                Add
              </Button>
              <Button variant={"hero"}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <NavbarPublic />

      <div className="container flex flex-col items-stretch justify-start gap-8 px-4">
        <div className="flex flex-col overflow-hidden rounded-lg shadow-md">
          <div className="h-40 w-full bg-red-300"></div>
          <div className="flex flex-row items-start justify-start gap-4 p-4 pb-0 md:gap-6">
            {company.logo ? (
              <img
                src={company.logo}
                alt={`${company.name} logo`}
                width={112}
                className="-mt-12 h-28 w-28 rounded-full border-8 border-white bg-white"
              />
            ) : (
              <CircleOff size={90} className="opacity-50" />
            )}
            <div className="flex w-full flex-col items-center justify-between pb-6 lg:flex-row">
              <div className="flex flex-1 flex-col items-start justify-start gap-2">
                <h1 className="flex gap-1 text-xl/none font-extrabold sm:text-2xl/none md:text-3xl/none">
                  {company?.update?.name ? company?.update?.name : company.name}
                  <Dialog>
                    <DialogTrigger className="min-w-fit">
                      <div className="flex items-center text-sm text-muted-foreground hover:text-black">
                        (<EditIcon size={10} /> Edit)
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Company Name</DialogTitle>
                      </DialogHeader>
                      <Form method="post" className="flex flex-col space-y-2">
                        <div className="flex flex-col space-y-2">
                          <Label>Name</Label>
                          <Input
                            placeholder="Name"
                            defaultValue={
                              company?.update?.name
                                ? company?.update?.name
                                : company.name
                            }
                            name="name"
                          />
                        </div>
                        <input type="hidden" name="action" value="edit" />
                        <input
                          type="hidden"
                          name="companyId"
                          value={company.id}
                        />
                        <DialogClose>
                          <Button
                            type="submit"
                            className="w-full"
                            variant={"hero"}
                          >
                            Save
                          </Button>
                        </DialogClose>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </h1>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <StarIcon className="fill-yellow-400" color="#facc15" />
                    <StarIcon className="fill-yellow-400" color="#facc15" />
                    <StarIcon className="fill-yellow-400" color="#facc15" />
                    <StarIcon className="fill-yellow-400" color="#facc15" />
                    <StarIcon className="fill-yellow-400" color="#facc15" />
                  </div>
                  <div className="font-semibold text-gray-400">|</div>
                  <div className="font-semibold">198 Reviews</div>
                </div>
                <div className="hidden items-center gap-2 lg:flex">
                  <Badge
                    variant={"outline"}
                    className="flex cursor-pointer items-center gap-x-1.5 text-sm"
                  >
                    clamied <CheckCircleIcon color="green" size={12} />
                  </Badge>
                  <div className="font-semibold text-gray-400">|</div>
                  {company.compinesToCategories &&
                  company.compinesToCategories.length > 0 ? (
                    <Link
                      to={`/directory/category/${company.compinesToCategories[0].category.id}?name=${company.compinesToCategories[0].category.name}`}
                      className="flex items-center gap-2 text-base/none font-semibold opacity-75 hover:underline sm:text-lg/none"
                    >
                      <FactoryIcon size={18} />
                      {company.compinesToCategories[0].category.name}
                    </Link>
                  ) : null}
                </div>
                {company.country ? (
                  <Link
                    to={`/directory/countries/${company.country}`}
                    className="hidden text-sm/none font-medium opacity-75 sm:text-base/none md:text-lg/none lg:block"
                  >
                    {[
                      company.street,
                      company.city,
                      company.state,
                      company.country,
                    ]
                      .filter((value) => !!value)
                      .join(", ")}
                  </Link>
                ) : null}
                {/* <div className="mt-4 flex flex-row flex-wrap items-center justify-start gap-4">
                  {company.domain ? (
                    <Button asChild variant="link" size="sm" noPadding>
                      <Link
                        to={`https://${company.domain}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <LinkIcon size={14} />
                        <span>{company.domain}</span>
                      </Link>
                    </Button>
                  ) : null}
                  {company.socials?.linkedIn ? (
                    <Button asChild variant="link" size="sm" noPadding>
                      <Link
                        to={company.socials.linkedIn}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Linkedin size={14} />
                        <span className="sr-only">Linkedin</span>
                      </Link>
                    </Button>
                  ) : null}
                  {company.socials?.twitter ? (
                    <Button asChild variant="link" size="sm" noPadding>
                      <Link
                        to={company.socials.twitter}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Twitter size={14} />
                        <span className="sr-only">Twitter</span>
                      </Link>
                    </Button>
                  ) : null}
                  {company.socials?.youtube ? (
                    <Button asChild variant="link" size="sm" noPadding>
                      <Link
                        to={company.socials.youtube}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Youtube size={14} />
                        <span className="sr-only">Youtube</span>
                      </Link>
                    </Button>
                  ) : null}
                </div> */}
                {/* <div className="mt-4 flex flex-row flex-wrap items-center justify-start gap-6">
                <p className="border-b-2 border-black font-medium">
                  Product Info
                </p>
                <p className="font-medium">Reviews</p>
                <p className="font-medium">Pricing</p>
                <p className="font-medium">Features</p>
              </div> */}
              </div>
              <div className="mb-3 hidden flex-row gap-3 lg:flex lg:flex-col">
                <Button variant={"secondary"} onClick={() => setForm(true)}>
                  Add FAQ's
                </Button>
                <Dialog>
                  <DialogTrigger className="min-w-fit">
                    <Button variant={"hero"} className="w-full">
                      Edit Website Link
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Website link</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col space-y-2">
                      <Label>Link</Label>
                      <Input
                        placeholder="Link"
                        defaultValue={company?.domain || ""}
                      />
                    </div>
                    <Button variant={"hero"}>Save</Button>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
          <div className="px-6">
            <div className="flex items-center gap-2 lg:hidden">
              <div>
                <Badge
                  variant={"outline"}
                  className="flex items-center gap-x-1.5 text-sm"
                >
                  clamied <CheckCircle color="green" size={12} />
                </Badge>
              </div>
              <div className="font-semibold text-gray-400">|</div>
              {/* {company.industry?.name ? (
                <Link
                  to={`/directory/category/${company.industry.id}`}
                  className="flex items-center gap-2 text-base/none font-semibold opacity-75 hover:underline sm:text-lg/none"
                >
                  <FactoryIcon size={18} />
                  {company.industry.name}
                </Link>
              ) : null} */}
            </div>
            {company.country ? (
              <Link
                to={`/directory/countries/${company.country}`}
                className="mb-6 text-sm/none font-medium opacity-75 sm:text-base/none md:text-lg/none lg:hidden"
              >
                {[company.street, company.city, company.state, company.country]
                  .filter((value) => !!value)
                  .join(", ")}
              </Link>
            ) : null}
          </div>
          <div className="mb-3 flex flex-row gap-3 px-6 py-2 lg:hidden lg:flex-col">
            <Button variant={"secondary"}>Contact {company.name}</Button>
            <Button variant={"hero"}>Visit Website</Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="sticky top-0 z-10 flex w-full items-center shadow-sm">
              <TabsTrigger value="overview" className="w-full">
                Overview
              </TabsTrigger>
              {/* <TabsTrigger value="pricing" className="w-full">
                Pricing
              </TabsTrigger> */}
              <TabsTrigger value="features" className="w-full">
                Features
              </TabsTrigger>
              {metricsHistoryChartPossible.length ? (
                <TabsTrigger value="metrics" className="w-full">
                  Metrics
                </TabsTrigger>
              ) : null}
            </TabsList>
            <TabsContent value="overview" className="flex flex-col gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Company Overview</CardTitle>
                  <div className="flex flex-row items-center justify-between gap-4 py-4">
                    <div className="h-px flex-1 rounded-full bg-border"></div>
                    <h3 className="text-base/none font-bold sm:text-lg/none md:text-xl/none">
                      About {company.name}
                    </h3>
                    <div className="h-px flex-1 rounded-full bg-border"></div>
                  </div>
                  <div className="flex gap-3">
                    <p>{company.description}</p>
                    <Dialog>
                      <DialogTrigger className="min-w-fit">
                        <div className="flex items-center text-sm text-muted-foreground hover:text-black">
                          (<EditIcon size={10} /> Edit)
                        </div>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Company Description</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col space-y-2">
                          <Label>About</Label>
                          <Textarea
                            rows={10}
                            defaultValue={company.description || ""}
                          />
                        </div>
                        <Button variant={"hero"}>Save</Button>
                      </DialogContent>
                    </Dialog>
                  </div>
                  {/* <p className="w-fit cursor-pointer text-blue-500">
                    Show More
                  </p> */}
                </CardHeader>
                <CardContent className="space-y-2">
                  <section className="flex flex-col items-stretch justify-start gap-6">
                    <div className="flex flex-row items-center justify-between gap-4">
                      <div className="h-px flex-1 rounded-full bg-border"></div>
                      <h3 className="flex items-center gap-2 text-base/none font-bold sm:text-lg/none md:text-xl/none">
                        {company.name} Details
                        <Dialog>
                          <DialogTrigger>
                            <Button size={"xs"} variant={"outline"}>
                              <EditIcon size={10} /> Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-[54rem] max-w-none">
                            <DialogHeader>
                              <DialogTitle>Edit Details</DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
                              <InfoCardEdit
                                label="Founded"
                                value={
                                  company?.yearOfIncorporation?.toString() || ""
                                }
                                icon={CalendarClock}
                                iconClassName="text-yellow-500"
                              />
                              <InfoCardEdit
                                label="Revenue"
                                value={company?.metrics?.revenue || ""}
                                icon={Banknote}
                                iconClassName="text-green-500"
                              />
                              <InfoCardEdit
                                label="MRR"
                                value={company?.metrics?.mrr || ""}
                                icon={Coins}
                                iconClassName="text-green-500"
                              />
                              <InfoCardEdit
                                label="Valuation"
                                value={company?.metrics?.valuation || ""}
                                icon={Gem}
                                iconClassName="text-blue-500"
                              />
                              <InfoCardEdit
                                label="Funding"
                                value={company?.metrics?.funding || ""}
                                icon={PiggyBank}
                                iconClassName="text-blue-500"
                              />
                              <InfoCardEdit
                                icon={Users2}
                                label="Customer Count"
                                value={company?.metrics?.customersCount || ""}
                              />
                              <InfoCardEdit
                                icon={HeartHandshake}
                                label="Team Size"
                                value={company?.metrics?.teamSize || ""}
                              />
                              <InfoCardEdit
                                label="ACV"
                                value={company?.metrics?.acv || ""}
                              />
                              <InfoCardEdit
                                label="ARPU"
                                value={company?.metrics?.arpu || ""}
                              />
                              <InfoCardEdit
                                label="CAC"
                                value={company?.metrics?.cac || ""}
                              />
                              <InfoCardEdit
                                label="DBC"
                                value={company?.metrics?.dbc || ""}
                              />
                              <InfoCardEdit
                                label="NRR"
                                value={company?.metrics?.nrr || ""}
                              />
                              <InfoCardEdit
                                label="Gross Churn"
                                value={company?.metrics?.grossChurn || ""}
                              />
                              <InfoCardEdit
                                label="Revenue Per Employee"
                                value={
                                  company?.metrics?.revenuePerEmployee || ""
                                }
                              />
                            </div>
                            <Button variant={"hero"}>Save</Button>
                          </DialogContent>
                        </Dialog>
                      </h3>
                      <div className="h-px flex-1 rounded-full bg-border"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
                      {company?.yearOfIncorporation ? (
                        <InfoCard
                          label="Founded"
                          value={company.yearOfIncorporation.toString()}
                          icon={CalendarClock}
                          iconClassName="text-yellow-500"
                        />
                      ) : null}
                      {company?.metrics?.revenue ? (
                        <InfoCard
                          label="Revenue"
                          value={formatNumber(
                            Number(company.metrics.revenue),
                            true,
                          )}
                          icon={Banknote}
                          iconClassName="text-green-500"
                        />
                      ) : null}
                      {company?.metrics?.mrr ? (
                        <InfoCard
                          label="MRR"
                          value={formatNumber(
                            Number(company.metrics.mrr),
                            true,
                          )}
                          icon={Coins}
                          iconClassName="text-green-500"
                        />
                      ) : null}
                      {company?.metrics?.valuation ? (
                        <InfoCard
                          label="Valuation"
                          value={formatNumber(
                            Number(company.metrics.valuation),
                            true,
                          )}
                          icon={Gem}
                          iconClassName="text-blue-500"
                        />
                      ) : null}
                      {company?.metrics?.funding ? (
                        <InfoCard
                          label="Funding"
                          value={formatNumber(
                            Number(company.metrics.funding),
                            true,
                          )}
                          icon={PiggyBank}
                          iconClassName="text-blue-500"
                        />
                      ) : null}
                      {company.metrics?.profitable ? (
                        Number(company.metrics.profitable) >= 0 ? (
                          <InfoCard
                            icon={TrendingUp}
                            label="Profitability"
                            value="Profitable"
                            iconClassName="text-green-500"
                          />
                        ) : (
                          <InfoCard
                            icon={TrendingDown}
                            label="Profitability"
                            value="In Loss"
                            iconClassName="text-red-500"
                          />
                        )
                      ) : null}
                      {company.metrics?.customersCount ? (
                        <InfoCard
                          icon={Users2}
                          label="Customer Count"
                          value={formatNumber(
                            Number(company.metrics.customersCount),
                          )}
                        />
                      ) : null}
                      {company.metrics?.teamSize ? (
                        <InfoCard
                          icon={HeartHandshake}
                          label="Team Size"
                          value={formatNumber(Number(company.metrics.teamSize))}
                        />
                      ) : null}
                      {company.metrics?.acv ? (
                        <InfoCard
                          label="ACV"
                          value={formatNumber(
                            Number(company.metrics.acv),
                            true,
                          )}
                        />
                      ) : null}
                      {company.metrics?.arpu ? (
                        <InfoCard
                          label="ARPU"
                          value={formatNumber(
                            Number(company.metrics.arpu),
                            true,
                          )}
                        />
                      ) : null}
                      {company.metrics?.cac ? (
                        <InfoCard
                          label="CAC"
                          value={formatNumber(
                            Number(company.metrics.cac),
                            true,
                          )}
                        />
                      ) : null}
                      {company.metrics?.dbc ? (
                        <InfoCard
                          label="DBC"
                          value={formatNumber(
                            Number(company.metrics.dbc),
                            true,
                          )}
                        />
                      ) : null}
                      {company.metrics?.nrr ? (
                        <InfoCard
                          label="NRR"
                          value={formatNumber(
                            Number(company.metrics.nrr),
                            true,
                          )}
                        />
                      ) : null}
                      {company.metrics?.grossChurn ? (
                        <InfoCard
                          label="Gross Churn"
                          value={company.metrics.grossChurn}
                        />
                      ) : null}
                      {company.metrics?.revenuePerEmployee ? (
                        <InfoCard
                          label="Revenue Per Employee"
                          value={formatNumber(
                            Number(company.metrics.revenuePerEmployee),
                            true,
                          )}
                        />
                      ) : null}
                    </div>
                  </section>
                  {company?.companyValues &&
                  company?.companyValues?.length > 0 ? (
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                      <div className="flex flex-row items-center justify-between gap-4 py-4">
                        <div className="h-px flex-1 rounded-full bg-border"></div>
                        <h3 className="flex items-center gap-2 text-base/none font-bold sm:text-lg/none md:text-xl/none">
                          Values & Ethics
                          <Dialog>
                            <DialogTrigger>
                              <Button size={"xs"} variant={"outline"}>
                                <EditIcon size={10} /> Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-96 w-[54rem] max-w-none overflow-y-scroll">
                              <DialogHeader>
                                <DialogTitle>Edit Details</DialogTitle>
                              </DialogHeader>
                              <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-3">
                                  {[...Array(6)].map((index, idx) => (
                                    <div
                                      className="flex flex-col space-y-2"
                                      key={idx}
                                    >
                                      <Label>Values & Ethics {idx + 1}</Label>
                                      <Textarea rows={3} />
                                    </div>
                                  ))}
                                </div>
                                <Button
                                  variant={"outline"}
                                  onClick={() =>
                                    setValuesCount(valuesCount + 1)
                                  }
                                >
                                  Add
                                </Button>
                              </div>
                              <Button variant={"hero"}>Save</Button>
                            </DialogContent>
                          </Dialog>
                        </h3>
                        <div className="h-px flex-1 rounded-full bg-border"></div>
                      </div>
                      {/* <p className="mt-2 text-gray-600">
                        We believe business is the greatest platform for change
                        and proudly invite others to join us in taking action
                        for people and the planet.
                      </p> */}
                      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
                        {company.companyValues.map((value: string) => (
                          <div>
                            <h3 className="flex items-center text-lg font-medium leading-6 text-gray-900">
                              <ChevronRightIcon className="mr-2 h-5 w-5 text-red-500" />
                              {value}
                            </h3>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                      <div className="flex flex-row items-center justify-between gap-4 py-4">
                        <div className="h-px flex-1 rounded-full bg-border"></div>
                        <h3 className="flex items-center gap-2 text-base/none font-bold sm:text-lg/none md:text-xl/none">
                          Values & Ethics
                          <Dialog>
                            <DialogTrigger>
                              <Button size={"xs"} variant={"outline"}>
                                <EditIcon size={10} /> Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-96 w-[54rem] max-w-none overflow-y-scroll">
                              <DialogHeader>
                                <DialogTitle>Edit Details</DialogTitle>
                              </DialogHeader>
                              <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-3">
                                  {[...Array(6)].map((index, idx) => (
                                    <div
                                      className="flex flex-col space-y-2"
                                      key={idx}
                                    >
                                      <Label>Values & Ethics {idx + 1}</Label>
                                      <Textarea rows={3} />
                                    </div>
                                  ))}
                                </div>
                                <Button
                                  variant={"outline"}
                                  onClick={() =>
                                    setValuesCount(valuesCount + 1)
                                  }
                                >
                                  Add
                                </Button>
                              </div>
                              <Button variant={"hero"}>Save</Button>
                            </DialogContent>
                          </Dialog>
                        </h3>
                        <div className="h-px flex-1 rounded-full bg-border"></div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex flex-col gap-4 py-7">
                  <div className="flex flex-row items-center justify-between gap-4 py-4">
                    <div className="h-px flex-1 rounded-full bg-border"></div>
                    <h3 className="flex items-center gap-2 text-base/none font-bold sm:text-lg/none md:text-xl/none">
                      Matrics{" "}
                    </h3>
                    <div className="h-px flex-1 rounded-full bg-border"></div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      className="w-fit"
                      variant={"hero"}
                      onClick={() => setValuation(valuation + 1)}
                    >
                      Add Valuation
                    </Button>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Funding Amount</TableHead>
                          <TableHead>Round Name</TableHead>
                          <TableHead>Valuation</TableHead>
                          <TableHead>Investors</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...Array(valuation)].map((funding) => (
                          <TableRow key={funding}>
                            <TableCell className="font-medium">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-[280px] justify-start text-left font-normal",
                                      !date && "text-muted-foreground",
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? (
                                      format(date, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </TableCell>
                            <TableCell>
                              <Input />
                            </TableCell>
                            <TableCell className={cn("font-medium")}>
                              <Input />
                            </TableCell>
                            <TableCell className={cn("font-medium")}>
                              <Input />
                            </TableCell>
                            <TableCell className="flex flex-row flex-wrap items-center justify-start gap-2">
                              <Input />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      className="w-fit"
                      variant={"hero"}
                      onClick={() => setTeamSize(teamSize + 1)}
                    >
                      Add TeamSize
                    </Button>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Team Size</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...Array(teamSize)].map((funding) => (
                          <TableRow key={funding}>
                            <TableCell className="font-medium">
                              <Input />
                            </TableCell>
                            <TableCell className="flex flex-row flex-wrap items-center justify-start gap-2">
                              <Input />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {company?.pricings && company?.pricings?.length > 0 ? (
                <Card>
                  <CardContent className="flex flex-col gap-4 py-7">
                    <div className="flex flex-row items-center justify-between gap-4 py-4">
                      <div className="h-px flex-1 rounded-full bg-border"></div>
                      <h3 className="flex items-center gap-2 text-base/none font-bold sm:text-lg/none md:text-xl/none">
                        Pricing{" "}
                        <Dialog>
                          <DialogTrigger>
                            <Button size={"xs"} variant={"outline"}>
                              <EditIcon size={10} /> Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-[54rem] max-w-none">
                            <DialogHeader>
                              <DialogTitle>Edit Details</DialogTitle>
                            </DialogHeader>
                            <Button variant={"hero"}>Save</Button>
                          </DialogContent>
                        </Dialog>
                      </h3>
                      <div className="h-px flex-1 rounded-full bg-border"></div>
                    </div>
                    <div className="flex h-full flex-col gap-4 lg:flex-row">
                      {company?.pricings?.map((plan: any) => (
                        <div className="flex h-full w-full flex-col items-center gap-2">
                          <Card className="w-full p-6 text-center">
                            <div className="text-2xl font-semibold">
                              {plan.name}
                            </div>
                            <div className="text-4xl font-extrabold">
                              ${plan.pricing}
                            </div>
                            <div className="text-sm leading-loose text-gray-500">
                              <p className="inline-block md:block">
                                {plan.description}
                              </p>
                            </div>
                            <ul className="my-4 grid w-full items-center justify-center gap-2 text-sm">
                              {plan.details?.map((detail: any) => (
                                <li className="flex items-center gap-2">
                                  <CheckIcon className="h-4 w-4" />
                                  {detail}
                                </li>
                              ))}
                            </ul>
                            <Link to={plan?.link || ""}>
                              <Button
                                variant={plan.highlight ? "hero" : "outline"}
                              >
                                Get Started
                              </Button>
                            </Link>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col gap-4 py-7">
                    <div className="flex flex-row items-center justify-between gap-4 py-4">
                      <div className="h-px flex-1 rounded-full bg-border"></div>
                      <h3 className="flex items-center gap-2 text-base/none font-bold sm:text-lg/none md:text-xl/none">
                        Pricing{" "}
                        <Dialog>
                          <DialogTrigger>
                            <Button size={"xs"} variant={"outline"}>
                              <EditIcon size={10} /> Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-[54rem] max-w-none">
                            <DialogHeader>
                              <DialogTitle>Edit Details</DialogTitle>
                            </DialogHeader>
                            <Button variant={"hero"}>Save</Button>
                          </DialogContent>
                        </Dialog>
                      </h3>
                      <div className="h-px flex-1 rounded-full bg-border"></div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {metricsHistoryChartPossible.length ? (
                <Card>
                  <CardContent className="pt-10">
                    <section className="flex flex-col items-stretch justify-start gap-6">
                      <div className="flex flex-row items-center justify-between gap-4">
                        <div className="h-px flex-1 rounded-full bg-border"></div>
                        <h3 className="text-base/none font-bold sm:text-lg/none md:text-xl/none">
                          Metrics History
                        </h3>
                        <div className="h-px flex-1 rounded-full bg-border"></div>
                      </div>

                      <ScrollArea className="mx-auto max-w-full">
                        <Tabs
                          value={selectedMetricsHistoryChart}
                          onValueChange={setSelectedMetricsHistoryChart}
                        >
                          <TabsList>
                            {metricsHistoryChartPossible.map((key) => {
                              const filter = FILTERS.find(
                                (filter) => filter.name === key,
                              )

                              return (
                                <TabsTrigger key={key} value={key}>
                                  {filter ? (
                                    <filter.icon
                                      size={16}
                                      className="opacity-50"
                                    />
                                  ) : null}
                                  <span>{filter ? filter.title : key}</span>
                                </TabsTrigger>
                              )
                            })}
                          </TabsList>
                        </Tabs>

                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>

                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                        className={cn("max-h-[50vh] min-h-[50vh]")}
                      >
                        <LineChart
                          width={320}
                          height={320}
                          data={metricsHistoryChartData}
                        >
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#000"
                            name={selectedMetricsHistoryChart}
                          />
                          <XAxis
                            dataKey="capturedAt"
                            interval="preserveStartEnd"
                          />
                          <Tooltip />
                        </LineChart>
                      </ResponsiveContainer>
                    </section>
                  </CardContent>
                </Card>
              ) : null}
              <div className="flex flex-col items-stretch justify-start gap-8">
                {company.fundingHistory.length ? (
                  <section className="flex flex-col items-stretch justify-start gap-6">
                    <div className="flex flex-row items-center justify-between gap-4">
                      <div className="h-px flex-1 rounded-full bg-border"></div>
                      <h3 className="text-base/none font-bold sm:text-lg/none md:text-xl/none">
                        Funding History
                      </h3>
                      <div className="h-px flex-1 rounded-full bg-border"></div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Funding Amount</TableHead>
                          <TableHead>Round Name</TableHead>
                          <TableHead>Valuation</TableHead>
                          <TableHead>Investors</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {company.fundingHistory.map((funding) => (
                          <TableRow key={funding.id}>
                            <TableCell className="font-medium">
                              {new Date(funding.capturedAt).toDateString()}
                            </TableCell>
                            <TableCell>
                              {funding.funding
                                ? formatNumber(Number(funding.funding))
                                : "-"}
                            </TableCell>
                            <TableCell className={cn("font-medium")}>
                              {funding.description
                                ? funding.description
                                : "Undisclosed"}
                            </TableCell>
                            <TableCell className={cn("font-medium")}>
                              {funding.valuation
                                ? formatNumber(Number(funding.valuation))
                                : "-"}
                            </TableCell>
                            <TableCell className="flex flex-row flex-wrap items-center justify-start gap-2">
                              -
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </section>
                ) : null}

                {company.productImages && company.productImages.length > 0 ? (
                  <div className="flex flex-col items-stretch justify-start gap-8">
                    <section className="flex flex-col items-stretch justify-start gap-6">
                      <div className="flex flex-row items-center justify-between gap-4">
                        <div className="h-px flex-1 rounded-full bg-border"></div>
                        <h3 className="text-base/none font-bold sm:text-lg/none md:text-xl/none">
                          Product Images
                        </h3>
                        <div className="h-px flex-1 rounded-full bg-border"></div>
                      </div>
                      <Carousel
                        swipeable
                        infiniteLoop
                        emulateTouch
                        autoPlay
                        centerSlidePercentage={80}
                      >
                        {company.productImages.map((image: string) => (
                          <div>
                            <img alt="" src={image} />
                          </div>
                        ))}
                      </Carousel>
                    </section>
                  </div>
                ) : null}
              </div>
            </TabsContent>
            <TabsContent value="pricing" className="flex flex-col gap-4">
              <Card>
                <CardContent className="flex flex-col gap-4 py-7">
                  <div className="flex flex-row items-center justify-between gap-4 py-4">
                    <div className="h-px flex-1 rounded-full bg-border"></div>
                    <h3 className="text-base/none font-bold sm:text-lg/none md:text-xl/none">
                      Pricing
                    </h3>
                    <div className="h-px flex-1 rounded-full bg-border"></div>
                  </div>
                  <div className="grid h-full gap-6 lg:grid-cols-3 lg:gap-12">
                    <div className="flex h-full flex-col items-center gap-2">
                      <Card className="p-6 text-center">
                        <div className="text-2xl font-semibold">Basic</div>
                        <div className="text-4xl font-extrabold">$29</div>
                        <div className="text-sm leading-loose text-gray-500">
                          <p className="inline-block md:block">
                            The Basic plan is designed for individuals and small
                            teams looking to get started with the platform. It
                            provides essential features for seamless
                            collaboration and deployment.
                          </p>
                        </div>
                        <ul className="my-4 grid gap-2 text-sm">
                          <li className="flex items-center gap-2">
                            <CheckIcon className="h-4 w-4" />
                            Unlimited bandwidth
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckIcon className="h-4 w-4" />
                            Edge network optimization
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckIcon className="h-4 w-4" />
                            Serverless functions
                          </li>
                        </ul>
                        <Link to="#">
                          <Button variant={"outline"}>Get Started</Button>
                        </Link>
                      </Card>
                    </div>
                    <div className="flex h-full flex-col items-center gap-2">
                      <Card className="h-full p-6 text-center">
                        <div className="text-2xl font-semibold">Pro</div>
                        <div className="text-4xl font-extrabold">$99</div>
                        <div className="text-sm leading-loose text-gray-500">
                          <p className="inline-block md:block">
                            The Pro plan is ideal for growing teams and
                            businesses that require advanced features for
                            scaling their applications. It includes all the
                            benefits of the Basic plan, with additional tools
                            for automation and optimization.
                          </p>
                        </div>
                        <ul className="my-4 grid gap-2 text-sm">
                          <li className="flex items-center gap-2">
                            <CheckIcon className="h-4 w-4" />
                            Continuous deployment
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckIcon className="h-4 w-4" />
                            Custom domains
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckIcon className="h-4 w-4" />
                            Performance analytics
                          </li>
                        </ul>
                        <Link to="#">
                          <Button variant={"outline"}>Get Started</Button>
                        </Link>
                      </Card>
                    </div>
                    <div className="flex h-full flex-col items-center gap-2">
                      <Card className="h-full p-6 text-center">
                        <div className="text-2xl font-semibold">Enterprise</div>
                        <div className="text-4xl font-extrabold">$249</div>
                        <div className="text-sm leading-loose text-gray-500">
                          <p className="inline-block md:block">
                            The Enterprise plan is tailored for large
                            organizations and high-traffic applications that
                            demand the highest level of security, compliance,
                            and support. It includes all the features of the Pro
                            plan, with additional enterprise-grade capabilities.
                          </p>
                        </div>
                        <ul className="my-4 grid gap-2 text-sm">
                          <li className="flex items-center gap-2">
                            <CheckIcon className="h-4 w-4" />
                            Advanced access controls
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckIcon className="h-4 w-4" />
                            24/7 premium support
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckIcon className="h-4 w-4" />
                            Performance monitoring
                          </li>
                        </ul>
                        <Link to="#">
                          <Button variant={"hero"}>Contact Sales</Button>
                        </Link>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="features" className="flex flex-col gap-4">
              <Card>
                <CardHeader>
                  <div className="flex flex-row items-center justify-between gap-4">
                    <div className="h-px flex-1 rounded-full bg-border"></div>
                    <h3 className="flex items-center gap-2 text-base/none font-bold sm:text-lg/none md:text-xl/none">
                      {company.name} Features
                      <Dialog>
                        <DialogTrigger>
                          <Button size={"xs"} variant={"outline"}>
                            <EditIcon size={10} /> Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[54rem] max-w-none">
                          <DialogHeader>
                            <DialogTitle>Edit Features</DialogTitle>
                          </DialogHeader>
                        </DialogContent>
                      </Dialog>
                    </h3>
                    <div className="h-px flex-1 rounded-full bg-border"></div>
                  </div>
                </CardHeader>
                {company.companyFeatures &&
                company.companyFeatures.length > 0 ? (
                  <CardContent>
                    <section className="flex flex-col items-stretch justify-start gap-4">
                      {company.companyFeatures.map((feature: any) => (
                        <div>
                          <h2 className="text-lg font-bold">
                            {feature.Heading}
                          </h2>
                          <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-3">
                            {feature.Points.map((point: string) => (
                              <div>
                                <h3 className="flex items-center text-sm font-medium leading-6 text-gray-900">
                                  <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                                  {point}
                                </h3>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </section>
                  </CardContent>
                ) : null}
              </Card>
            </TabsContent>
            <TabsContent value="metrics" className="flex flex-col gap-4">
              <Card>
                <CardContent className="pt-10">
                  {metricsHistoryChartPossible.length ? (
                    <section className="flex flex-col items-stretch justify-start gap-6">
                      <div className="flex flex-row items-center justify-between gap-4">
                        <div className="h-px flex-1 rounded-full bg-border"></div>
                        <h3 className="text-base/none font-bold sm:text-lg/none md:text-xl/none">
                          Metrics History
                        </h3>
                        <div className="h-px flex-1 rounded-full bg-border"></div>
                      </div>

                      <ScrollArea className="mx-auto max-w-full">
                        <Tabs
                          value={selectedMetricsHistoryChart}
                          onValueChange={setSelectedMetricsHistoryChart}
                        >
                          <TabsList>
                            {metricsHistoryChartPossible.map((key) => {
                              const filter = FILTERS.find(
                                (filter) => filter.name === key,
                              )

                              return (
                                <TabsTrigger key={key} value={key}>
                                  {filter ? (
                                    <filter.icon
                                      size={16}
                                      className="opacity-50"
                                    />
                                  ) : null}
                                  <span>{filter ? filter.title : key}</span>
                                </TabsTrigger>
                              )
                            })}
                          </TabsList>
                        </Tabs>

                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>

                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                        className={cn("max-h-[50vh] min-h-[50vh]")}
                      >
                        <LineChart
                          width={320}
                          height={320}
                          data={metricsHistoryChartData}
                        >
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#000"
                            name={selectedMetricsHistoryChart}
                          />
                          <XAxis
                            dataKey="capturedAt"
                            interval="preserveStartEnd"
                          />
                          <Tooltip />
                        </LineChart>
                      </ResponsiveContainer>
                    </section>
                  ) : null}
                </CardContent>
              </Card>
              {company.fundingHistory.length ? (
                <section className="flex flex-col items-stretch justify-start gap-6">
                  <div className="flex flex-row items-center justify-between gap-4">
                    <div className="h-px flex-1 rounded-full bg-border"></div>
                    <h3 className="text-base/none font-bold sm:text-lg/none md:text-xl/none">
                      Funding History
                    </h3>
                    <div className="h-px flex-1 rounded-full bg-border"></div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Funding Amount</TableHead>
                        <TableHead>Round Name</TableHead>
                        <TableHead>Valuation</TableHead>
                        <TableHead>Investors</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {company.fundingHistory.map((funding) => (
                        <TableRow key={funding.id}>
                          <TableCell className="font-medium">
                            {new Date(funding.capturedAt).toDateString()}
                          </TableCell>
                          <TableCell>
                            {funding.funding
                              ? formatNumber(Number(funding.funding))
                              : "-"}
                          </TableCell>
                          <TableCell className={cn("font-medium")}>
                            {funding.description
                              ? funding.description
                              : "Undisclosed"}
                          </TableCell>
                          <TableCell className={cn("font-medium")}>
                            {funding.valuation
                              ? formatNumber(Number(funding.valuation))
                              : "-"}
                          </TableCell>
                          <TableCell className="flex flex-row flex-wrap items-center justify-start gap-2">
                            -
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </section>
              ) : null}
            </TabsContent>
          </Tabs>
          <div className="w-full lg:w-1/3">
            {company.competitors.length ? (
              <ScrollArea className="w-full rounded-md border-2 border-[#ff322b80] p-2">
                <div className="my-3 flex flex-row items-center justify-between gap-4">
                  <div className="h-px flex-1 rounded-full bg-border"></div>
                  <h3 className="text-base/none font-bold sm:text-lg/none md:text-xl/none">
                    Similar Companies
                  </h3>
                  <div className="h-px flex-1 rounded-full bg-border"></div>
                </div>
                <div className="flex flex-col items-stretch justify-start gap-4">
                  {company.competitors.map((competitor) => {
                    return (
                      <Link
                        key={competitor.id}
                        to={`/companies/${competitor.id}`}
                        className="flex flex-col items-stretch justify-start gap-2 rounded-lg border border-border p-4 hover:bg-secondary"
                      >
                        <div className="flex flex-row items-center justify-start gap-2">
                          {competitor.logo ? (
                            <img
                              src={competitor.logo}
                              alt=""
                              width={16}
                              height={16}
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <CircleOff size={16} />
                          )}

                          <p className="text-base/none font-semibold">
                            {competitor.name}
                          </p>
                        </div>
                        {/* {competitor.industry ? (
                          <div className="mt-auto flex flex-row items-center justify-start gap-2">
                            <Boxes size={14} className="opacity-50" />
                            <p className="text-sm/none font-medium">
                              {competitor.industry.name}
                            </p>
                          </div>
                        ) : null} */}
                      </Link>
                    )
                  })}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            ) : null}
          </div>
        </div>
      </div>

      {/* {hideData ? (
        <div className="sticky bottom-0 z-50 h-max w-full border-y border-border bg-card/50 text-card-foreground backdrop-blur-lg">
          <div className="container flex flex-col items-center justify-center gap-4 px-4 py-4 text-center md:py-8">
            <p className="max-w-3xl text-xl/snug font-bold [text-wrap:_balance] md:text-3xl/snug">
              SaasKart.co
            </p>
            <Button asChild variant="hero">
              <Link to="/">
                <Rocket size={16} className="opacity-50" />
                <span>Learn More</span>
              </Link>
            </Button>
          </div>
        </div>
      ) : null} */}

      <Footer />
    </div>
  )
}

function InfoCard({
  label,
  value,
  icon: Icon,
  valueClassName,
  iconClassName,
}: {
  label: string
  value: string
  icon?: LucideIcon
  valueClassName?: string
  iconClassName?: string
}) {
  return (
    <div className="flex flex-row items-center justify-start gap-4">
      {Icon ? (
        <Icon size={24} className={cn("opacity-50", iconClassName)} />
      ) : (
        <div className="h-6 w-6"></div>
      )}
      <div className="flex flex-1 flex-col items-start justify-start gap-2">
        <h4 className="text-lg/none font-medium opacity-75">{label}</h4>
        <p className={cn("text-xl/none font-semibold", valueClassName)}>
          {value}
        </p>
      </div>
    </div>
  )
}

function InfoCardEdit({
  label,
  value,
  icon: Icon,
  valueClassName,
  iconClassName,
}: {
  label: string
  value: string
  icon?: LucideIcon
  valueClassName?: string
  iconClassName?: string
}) {
  return (
    <div className="flex flex-row items-center justify-start gap-4">
      {Icon ? (
        <Icon size={24} className={cn("opacity-50", iconClassName)} />
      ) : (
        <div className="h-6 w-6"></div>
      )}
      <div className="flex flex-1 flex-col items-start justify-start gap-2">
        <h4 className="text-lg/none font-medium opacity-75">{label}</h4>
        <p className={cn("text-xl/none font-semibold", valueClassName)}>
          {value}
        </p>
        <Input type="text" defaultValue={value} />
      </div>
    </div>
  )
}
