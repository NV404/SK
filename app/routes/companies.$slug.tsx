import {
  type LoaderFunctionArgs,
  type MetaFunction,
  type SerializeFrom,
  redirect,
} from "@remix-run/node"
import { Link, useFetcher, useLoaderData } from "@remix-run/react"
import {
  Banknote,
  Boxes,
  CalendarClock,
  CheckCircle,
  CheckIcon,
  ChevronRightIcon,
  CircleOff,
  Coins,
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
import { useMemo, useState } from "react"
import { Carousel } from "react-responsive-carousel"
import "react-responsive-carousel/lib/styles/carousel.min.css"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts"
import { type action as authenticationAction } from "~/routes/api.authentication"

import { Footer, NavbarDashboard, NavbarPublic } from "@/components/layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { getUser } from "@/lib/session.server"
import { cn, formatNumber, getRandom, groupBy } from "@/lib/utils"

import { db, type schema } from "@/db/index.server"

import { getMetaTags } from "@/config/meta"
import { FILTERS } from "@/config/options"

export async function loader({ request, params }: LoaderFunctionArgs) {
  const slug = params.slug

  if (!slug) {
    return redirect("/")
  }

  let company = await db.query.companies.findFirst({
    columns: {
      description: false,
    },
    where: (company, { eq }) => eq(company.id, slug),
    with: {
      socials: {
        columns: {
          crunchbase: false,
          facebook: false,
          website: false,
        },
      },
      industry: true,
      founders: {
        columns: {
          additionalInformation: false,
          biography: false,
        },
      },
      metrics: true,
      metricsHistory: true,
      fundingHistory: true,
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
            industry: true,
          },
        },
      },
      where: (company, { eq }) => eq(company.companyId, slug),
      limit: 10,
    })
  ).map((row) => row.competitor)

  const user = await getUser(request, false)
  const isAuthenticated = Boolean(user)
  const hideData = false

  function fuzzy<T = string | null>(value: T): T {
    if (value === null) return null as T
    return "Hidden" as T
  }

  if (hideData) {
    company.founders = company.founders.map((founder) => ({
      ...founder,
      email: fuzzy(founder.email),
      personalEmail: fuzzy(founder.personalEmail),
    }))
    company.metrics = {
      ...company.metrics,
      acv: fuzzy(company.metrics.acv),
      arpu: fuzzy(company.metrics.arpu),
      cac: fuzzy(company.metrics.cac),
      customersCount: fuzzy(company.metrics.customersCount),
      mrr: fuzzy(company.metrics.mrr),
      nrr: fuzzy(company.metrics.nrr),
      dbc: fuzzy(company.metrics.dbc),
      // funding: fuzzy(company.metrics.funding),
      grossChurn: fuzzy(company.metrics.grossChurn),
      // revenue: fuzzy(company.metrics.revenue),
      // revenuePerEmployee: fuzzy(company.metrics.revenuePerEmployee),
      // teamSize: fuzzy(company.metrics.teamSize),
      valuation: fuzzy(company.metrics.valuation),
      profitable: fuzzy(company.metrics.profitable),
    }
    company.fundingHistory = company.fundingHistory.map((row) => ({
      ...row,
      funding: fuzzy(row.funding),
      valuation: fuzzy(row.valuation),
    }))
    company.metricsHistory = company.metricsHistory.map((row) => ({
      ...row,
      value: fuzzy(row.value),
    }))
  }

  return {
    user,
    hideData,
    company: {
      ...company,
      competitors,
    },
  }
}

function getCompanyDescription({ company }: SerializeFrom<typeof loader>) {
  return `${
    company.name
  } is a ${company.industry?.name?.toLowerCase()} company based in ${
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
  const isAuthenticated = loaderData.user
  const hideData = loaderData.hideData
  const company = loaderData.company

  const fundingHistoryChartData = useMemo(
    () =>
      company.fundingHistory
        .map((row) => ({
          capturedAt: new Date(row.capturedAt).getFullYear(),
          funding: hideData ? getRandom() : row.funding,
          valuation: hideData ? getRandom() : row.valuation,
        }))
        .sort((rowA, rowB) => rowA.capturedAt - rowB.capturedAt),
    [hideData, company.fundingHistory],
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
          value: hideData ? getRandom() : row.value,
        }))
        .sort((rowA, rowB) => rowA.capturedAt - rowB.capturedAt),
    [hideData, metricsHistoryGrouped, selectedMetricsHistoryChart],
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
  const authenticationFetcher = useFetcher<typeof authenticationAction>({
    key: "authentication",
  })

  return (
    <div className="relative flex min-h-screen flex-col items-stretch gap-8 py-4 sm:py-8">
      <Dialog open={contactForm} onOpenChange={setForm}>
        <DialogContent>
          <DialogHeader className="font-bold">Conatct Form</DialogHeader>
          <div className="flex flex-col gap-2">
            <Label>Name</Label>
            <Input type="text" className="w-full"></Input>
          </div>
        </DialogContent>
      </Dialog>
      {isAuthenticated ? <NavbarDashboard /> : <NavbarPublic />}

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
            <div className="flex w-full flex-col items-center justify-between lg:flex-row">
              <div className="flex flex-1 flex-col items-start justify-start gap-2">
                <h1 className="text-xl/none font-extrabold sm:text-2xl/none md:text-3xl/none">
                  {company.name}
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
                  <Dialog defaultOpen={false}>
                    <DialogTrigger asChild>
                      <div>
                        <Badge
                          variant={"outline"}
                          className="flex cursor-pointer items-center gap-x-1.5 text-sm"
                        >
                          unclamied <XCircleIcon color="red" size={12} />
                        </Badge>
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <authenticationFetcher.Form
                        // action="/api/authentication"
                        method="post"
                        className="contents"
                      >
                        <fieldset
                          disabled={authenticationFetcher.state !== "idle"}
                          className="contents"
                        >
                          <DialogHeader>
                            <DialogTitle>Login</DialogTitle>
                            <DialogDescription>
                              Authenticate with the email you used to buy the
                              product.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex flex-col items-stretch justify-start gap-2">
                            <Button variant={"outline"}>
                              Login with Google
                            </Button>
                            <Button variant={"outline"}>
                              Login with Linkedin
                            </Button>
                            <Separator className="m-2" />
                            <Button variant={"secondary"}>
                              Use Business Email
                            </Button>
                          </div>
                          {/* <div className="flex flex-col items-stretch justify-start gap-2">
                  <Input
                    type="email"
                    name="email"
                    placeholder="Email"
                    required
                    readOnly={isOTPSent}
                    autoFocus
                  />
                  {!isOTPSent ? (
                    <Input
                      type="text"
                      name="lifetimeRedeemCode"
                      placeholder="Redeem Code? (optional)"
                    />
                  ) : null}
                  {isOTPSent ? (
                    <Input
                      type="text"
                      name="otp"
                      placeholder="One Time Password"
                      required
                      autoFocus
                    />
                  ) : null}
                </div> */}
                          {/* <DialogFooter>
                  {isOTPSent ? (
                    <Button variant="hero" type="submit">
                      <Check size={16} className="opacity-50" />
                      <span>Confirm</span>
                    </Button>
                  ) : (
                    <Button type="submit">
                      <Fingerprint size={16} className="opacity-50" />
                      <span>Continue</span>
                    </Button>
                  )}
                </DialogFooter> */}
                        </fieldset>
                      </authenticationFetcher.Form>
                    </DialogContent>
                  </Dialog>
                  <div className="font-semibold text-gray-400">|</div>
                  {company.industry?.name ? (
                    <Link
                      to={`/directory/industries/${company.industry.id}`}
                      className="flex items-center gap-2 text-base/none font-semibold opacity-75 hover:underline sm:text-lg/none"
                    >
                      <FactoryIcon size={18} />
                      {company.industry.name}
                    </Link>
                  ) : null}
                </div>
                {company.country ? (
                  <Link
                    to={`/directory/countries/${company.country}`}
                    className="mb-6 hidden text-sm/none font-medium opacity-75 sm:text-base/none md:text-lg/none lg:block"
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
                  Contact {company.name}
                </Button>
                <Button variant={"hero"}>Visit Website</Button>
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
              {company.industry?.name ? (
                <Link
                  to={`/directory/industries/${company.industry.id}`}
                  className="flex items-center gap-2 text-base/none font-semibold opacity-75 hover:underline sm:text-lg/none"
                >
                  <FactoryIcon size={18} />
                  {company.industry.name}
                </Link>
              ) : null}
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
            <TabsList className="sticky top-0 z-10 grid w-full grid-cols-5 shadow-sm">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
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
                  <p>
                    Salesforce Sales Cloud is the complete platform for
                    Salesblazers, our community of sellers, sales leaders, and
                    sales operations professionals, to grow sales and increase
                    productivity. With the #1 AI Salesforce Sales Cloud is the
                    complete platform for Salesblazers, our community of
                    sellers, sales leaders, and sales operations professionals,
                    to grow sales and increase...
                  </p>
                  <p className="w-fit cursor-pointer text-blue-500">
                    Show More
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <section className="flex flex-col items-stretch justify-start gap-6">
                    <div className="flex flex-row items-center justify-between gap-4">
                      <div className="h-px flex-1 rounded-full bg-border"></div>
                      <h3 className="text-base/none font-bold sm:text-lg/none md:text-xl/none">
                        {company.name} Details
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
                          valueClassName={hideData ? "blur-sm" : ""}
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
                          valueClassName={hideData ? "blur-sm" : ""}
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
                            valueClassName={hideData ? "blur-sm" : ""}
                            iconClassName="text-green-500"
                          />
                        ) : (
                          <InfoCard
                            icon={TrendingDown}
                            label="Profitability"
                            value="In Loss"
                            valueClassName={hideData ? "blur-sm" : ""}
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
                          valueClassName={hideData ? "blur-sm" : ""}
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
                          valueClassName={hideData ? "blur-sm" : ""}
                        />
                      ) : null}
                      {company.metrics?.arpu ? (
                        <InfoCard
                          label="ARPU"
                          value={formatNumber(
                            Number(company.metrics.arpu),
                            true,
                          )}
                          valueClassName={hideData ? "blur-sm" : ""}
                        />
                      ) : null}
                      {company.metrics?.cac ? (
                        <InfoCard
                          label="CAC"
                          value={formatNumber(
                            Number(company.metrics.cac),
                            true,
                          )}
                          valueClassName={hideData ? "blur-sm" : ""}
                        />
                      ) : null}
                      {company.metrics?.dbc ? (
                        <InfoCard
                          label="DBC"
                          value={formatNumber(
                            Number(company.metrics.dbc),
                            true,
                          )}
                          valueClassName={hideData ? "blur-sm" : ""}
                        />
                      ) : null}
                      {company.metrics?.nrr ? (
                        <InfoCard
                          label="NRR"
                          value={formatNumber(
                            Number(company.metrics.nrr),
                            true,
                          )}
                          valueClassName={hideData ? "blur-sm" : ""}
                        />
                      ) : null}
                      {company.metrics?.grossChurn ? (
                        <InfoCard
                          label="Gross Churn"
                          value={company.metrics.grossChurn}
                          valueClassName={hideData ? "blur-sm" : ""}
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
                  <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="flex flex-row items-center justify-between gap-4 py-4">
                      <div className="h-px flex-1 rounded-full bg-border"></div>
                      <h3 className="text-base/none font-bold sm:text-lg/none md:text-xl/none">
                        Values & Ethics
                      </h3>
                      <div className="h-px flex-1 rounded-full bg-border"></div>
                    </div>
                    <p className="mt-2 text-gray-600">
                      We believe business is the greatest platform for change
                      and proudly invite others to join us in taking action for
                      people and the planet.
                    </p>
                    <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
                      <div>
                        <h3 className="flex items-center text-lg font-medium leading-6 text-gray-900">
                          <ChevronRightIcon className="mr-2 h-5 w-5 text-red-500" />
                          Trust is our #1 value.
                        </h3>
                        <p className="mt-2 text-gray-600">
                          We build trust with stakeholders by leading with
                          ethics and through the integrity of our technology.
                        </p>
                      </div>
                      <div>
                        <h3 className="flex items-center text-lg font-medium leading-6 text-gray-900">
                          <ChevronRightIcon className="mr-2 h-5 w-5 text-red-500" />
                          Customer Success
                        </h3>
                        <p className="mt-2 text-gray-600">
                          When our customers succeed, we succeed.
                        </p>
                      </div>
                      <div>
                        <h3 className="flex items-center text-lg font-medium leading-6 text-gray-900">
                          <ChevronRightIcon className="mr-2 h-5 w-5 text-red-500" />
                          Innovation
                        </h3>
                        <p className="mt-2 text-gray-600">
                          Our products are easy-to-use, integrated, scalable,
                          and deliver fast time to value.
                        </p>
                      </div>
                      <div>
                        <h3 className="flex items-center text-lg font-medium leading-6 text-gray-900">
                          <ChevronRightIcon className="mr-2 h-5 w-5 text-red-500" />
                          Equality
                        </h3>
                        <p className="mt-2 text-gray-600">
                          We are more powerful when we work together.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                        className={cn("max-h-[50vh] min-h-[50vh]", {
                          "blur-sm": hideData,
                        })}
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
                            <TableCell
                              className={cn("font-medium", {
                                "blur-sm": hideData,
                              })}
                            >
                              {funding.description
                                ? funding.description
                                : "Undisclosed"}
                            </TableCell>
                            <TableCell
                              className={cn("font-medium", {
                                "blur-sm": hideData,
                              })}
                            >
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
                      centerSlidePercentage={80}
                    >
                      <div>
                        <img
                          alt=""
                          src="https://images.ctfassets.net/hrltx12pl8hq/28ECAQiPJZ78hxatLTa7Ts/2f695d869736ae3b0de3e56ceaca3958/free-nature-images.jpg?fit=fill&w=1200&h=630"
                        />
                      </div>
                      <div>
                        <img
                          alt=""
                          src="https://images.ctfassets.net/hrltx12pl8hq/28ECAQiPJZ78hxatLTa7Ts/2f695d869736ae3b0de3e56ceaca3958/free-nature-images.jpg?fit=fill&w=1200&h=630"
                        />
                      </div>
                      <div>
                        <img
                          alt=""
                          src="https://images.ctfassets.net/hrltx12pl8hq/28ECAQiPJZ78hxatLTa7Ts/2f695d869736ae3b0de3e56ceaca3958/free-nature-images.jpg?fit=fill&w=1200&h=630"
                        />
                      </div>
                    </Carousel>
                  </section>
                </div>
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
                    <h3 className="text-base/none font-bold sm:text-lg/none md:text-xl/none">
                      {company.name} Features
                    </h3>
                    <div className="h-px flex-1 rounded-full bg-border"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <section className="flex flex-col items-stretch justify-start gap-4">
                    <div>
                      <h2 className="text-lg font-bold">Tasks</h2>
                      <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                          <h3 className="flex items-center text-sm font-medium leading-6 text-gray-900">
                            <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                            Trust is our #1 value.
                          </h3>
                        </div>
                        <div>
                          <h3 className="flex items-center text-sm font-medium leading-6 text-gray-900">
                            <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                            Trust is our #1 value.
                          </h3>
                        </div>
                        <div>
                          <h3 className="flex items-center text-sm font-medium leading-6 text-gray-900">
                            <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                            Trust is our #1 value.
                          </h3>
                        </div>
                        <div>
                          <h3 className="flex items-center text-sm font-medium leading-6 text-gray-900">
                            <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                            Trust is our #1 value.
                          </h3>
                        </div>
                      </div>
                    </div>
                  </section>
                </CardContent>
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
                        className={cn("max-h-[50vh] min-h-[50vh]", {
                          "blur-sm": hideData,
                        })}
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
                          <TableCell
                            className={cn("font-medium", {
                              "blur-sm": hideData,
                            })}
                          >
                            {funding.description
                              ? funding.description
                              : "Undisclosed"}
                          </TableCell>
                          <TableCell
                            className={cn("font-medium", {
                              "blur-sm": hideData,
                            })}
                          >
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
              <ScrollArea className="w-full rounded-md border p-2">
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
                        {competitor.industry ? (
                          <div className="mt-auto flex flex-row items-center justify-start gap-2">
                            <Boxes size={14} className="opacity-50" />
                            <p className="text-sm/none font-medium">
                              {competitor.industry.name}
                            </p>
                          </div>
                        ) : null}
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
