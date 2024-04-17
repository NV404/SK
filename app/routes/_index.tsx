import {
  ActionFunction,
  type LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { eq } from "drizzle-orm"
import {
  ArrowUp,
  Compass,
  Leaf,
  Palmtree,
  Rocket,
  Verified,
} from "lucide-react"
import { cacheHeader } from "pretty-cache-header"

import ChatbotButton from "@/components/ChatbotButton"
import { Footer, NavbarPublic } from "@/components/layout"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { badgeVariants } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// import { authenticator } from "@/lib/auth.server"
import { desc } from "@/lib/drizzle.server"
import { getUserId } from "@/lib/session.server"

import { db, schema } from "@/db/index.server"

export async function loader({ request }: LoaderFunctionArgs) {
  return json({ apiKey: process.env.OPEN_AI_KEY })
}

// export const action: ActionFunction = async ({ request, context }) => {
//   // call my authenticator
//   const resp = await authenticator.authenticate("form", request, {
//     successRedirect: "/",
//     failureRedirect: "/",
//     throwOnError: true,
//     context,
//   })
//   console.log(resp)
//   return resp
// }

export default function Index() {
  let { apiKey } = useLoaderData<typeof loader>()

  return (
    <div
      id="top"
      className="relative flex min-h-screen flex-col items-stretch gap-8 overflow-x-hidden py-4 sm:py-8"
    >
      <NavbarPublic />
      <ChatbotButton apiKey={apiKey as string} />

      <header className="container flex min-h-[60vh] flex-col items-center justify-center gap-8 px-4 text-center">
        <div className="flex flex-col items-stretch justify-start gap-4">
          <h1 className="max-w-3xl bg-gradient-to-tr from-[#ff9390] via-[#810d09] to-[#810d09] bg-clip-text pb-1 text-4xl/none font-extrabold text-transparent [text-wrap:_balance] sm:text-5xl/none md:text-6xl/none">
            India's Leading SaaS Discovery and Buying Platform
          </h1>
          <h2 className="max-w-3xl text-xs/snug font-medium opacity-75 [text-wrap:_balance] sm:text-sm/snug md:text-base/snug">
            One Dashboard to easily manage your software stack so your company
            can grow sustainably. SaaSKart’s integration will help your business
            optimize your SaaS Stack and save up to 30% on Software Buying.
          </h2>
        </div>
        {/* <div className="flex flex-row items-center justify-center gap-4">
          <p className="text-xl/none font-semibold opacity-75 md:text-2xl/none">
            30k+ companies.
          </p>
          <p className="text-xl/none font-semibold opacity-75 md:text-2xl/none">
            25k+ founders.
          </p>
        </div> */}
        <div className="flex flex-row flex-wrap items-center justify-center gap-2">
          <Button asChild variant="secondary" size="lg">
            <Link to="/directory/category">
              <Compass size={18} className="opacity-50" />
              <span>Categories</span>
            </Link>
          </Button>
          <Button asChild variant="hero" size="lg">
            <Link to="#pricing">
              <Rocket size={18} className="animate-pulse opacity-75" />
              <span>Buy now</span>
            </Link>
          </Button>
        </div>
      </header>
      {/* 
      <Separator />

      <div className="flex flex-col items-center justify-start gap-4">
        <p className="flex max-w-3xl flex-col items-center justify-center gap-2 text-center text-base/none font-medium opacity-75 [text-wrap:_balance]">
          <Verified size={24} className="text-green-500 opacity-100" />
          <span>
            Checkout freely available data for these companies for trust &
            accuracy!
          </span>
        </p>
        <div className="flex flex-row flex-wrap items-stretch justify-center gap-2">
          {publicCompanies.map((company) => {
            return (
              <Link
                key={company.id}
                to={`/companies/${company.id}`}
                className={badgeVariants({
                  variant: "outline",
                  className:
                    "gap-2 py-1 hover:bg-secondary hover:text-secondary-foreground",
                })}
              >
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={`logo ${company.name}`}
                    loading="lazy"
                    decoding="async"
                    width={16}
                    height={16}
                    className="rounded-[4px]"
                  />
                ) : null}
                <span className="leading-none">{company.name}</span>
              </Link>
            )
          })}
        </div>
      </div>

      <Separator />

      <section className="container grid grid-cols-1 gap-8 md:grid-cols-2">
        <img
          src="/marketing/overview.png"
          alt="overview"
          className="order-1 md:-order-1"
          loading="lazy"
          decoding="async"
        />
        <div className="flex flex-col items-center justify-center gap-4 px-4 text-center">
          <h3 className="max-w-2xl text-3xl/none font-semibold [text-wrap:_balance] sm:text-4xl/none md:text-5xl/none">
            Complete metrics
          </h3>
          <p className="text-lg/none font-semibold opacity-75 md:text-xl/none">
            Every data point you may need
          </p>
        </div>
      </section>

      <Separator />

      <section className="container grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col items-center justify-center gap-4 px-4 text-center">
          <h3 className="max-w-2xl text-3xl/none font-semibold [text-wrap:_balance] sm:text-4xl/none md:text-5xl/none">
            People insights
          </h3>
          <p className="text-lg/none font-semibold opacity-75 md:text-xl/none">
            Find your next deal or partnership
          </p>
        </div>
        <img
          src="/marketing/people.png"
          alt="people"
          loading="lazy"
          decoding="async"
        />
      </section>

      <Separator />

      <section className="container grid grid-cols-1 gap-8 md:grid-cols-2">
        <img
          src="/marketing/filters.png"
          alt="filters"
          className="order-1 md:-order-1"
          loading="lazy"
          decoding="async"
        />
        <div className="flex flex-col items-center justify-center gap-4 px-4 text-center">
          <h3 className="max-w-2xl text-3xl/none font-semibold [text-wrap:_balance] sm:text-4xl/none md:text-5xl/none">
            Fantastic UX & query capabilities
          </h3>
          <p className="text-lg/none font-semibold opacity-75 md:text-xl/none">
            Search, sort and filter the dataset quickly and effectively
          </p>
        </div>
      </section>

      <Separator />

      <section className="container grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col items-center justify-center gap-4 px-4 text-center">
          <h3 className="max-w-2xl text-3xl/none font-semibold [text-wrap:_balance] sm:text-4xl/none md:text-5xl/none">
            Powerful visualizations
          </h3>
          <p className="text-lg/none font-semibold opacity-75 md:text-xl/none">
            Helpful graphs to help you understand your data
          </p>
        </div>
        <img
          src="/marketing/charts.png"
          alt="charts"
          loading="lazy"
          decoding="async"
        />
      </section>

      <Separator />

      <section className="container grid grid-cols-1 gap-8 md:grid-cols-2">
        <img
          src="/marketing/customers.png"
          alt="customers"
          className="order-1 mx-auto w-full max-w-lg p-4 md:-order-1"
          loading="lazy"
          decoding="async"
        />
        <div className="flex flex-col items-center justify-center gap-4 px-4 text-center">
          <h3 className="max-w-2xl text-3xl/none font-semibold [text-wrap:_balance] sm:text-4xl/none md:text-5xl/none">
            Useful for everyone
          </h3>
          <p className="text-lg/none font-semibold opacity-75 md:text-xl/none">
            High quality data with many possibilities
          </p>
        </div>
      </section>

      <Separator />

      <div
        id="pricing"
        className="container flex min-h-[60vh] flex-col items-center justify-center gap-8 px-4"
      >
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <h3 className="max-w-2xl text-3xl/none font-semibold [text-wrap:_balance] sm:text-4xl/none md:text-5xl/none">
            Pricing
          </h3>
          <p className="text-lg/none font-semibold opacity-75 md:text-xl/none">
            Value for money which you will find nowhere
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-7">
          <Card className="shadow-2xl md:col-span-3">
            <CardHeader>
              <CardTitle>$29 /m</CardTitle>
              <CardDescription>Pay monthly, cancel anytime</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button
                asChild
                variant="secondary"
                className="lemonsqueezy-button w-full"
              >
                <Link to="https://buy.saasdata.app/checkout/buy/21d47411-5ed9-4158-8522-ee48a0bb1426?embed=1">
                  <Leaf size={16} className="opacity-50" />
                  <span>Subscribe Monthly</span>
                </Link>
              </Button>
            </CardFooter>
          </Card>
          <div className="flex flex-row items-center justify-center gap-0 md:col-span-1">
            <p className="text-sm/none opacity-75">OR</p>
          </div>
          <Card className="shadow-2xl shadow-indigo-200 md:col-span-3 ">
            <CardHeader>
              <CardTitle>$499 /life</CardTitle>
              <CardDescription>Pay ones, use forever</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button
                asChild
                variant="hero"
                className="lemonsqueezy-button w-full"
              >
                <Link to="https://buy.saasdata.app/checkout/buy/ba5f724a-f98b-4b9b-9ef9-85b3c7649bd1?embed=1">
                  <Palmtree size={16} className="opacity-50" />
                  <span>Buy Lifetime</span>
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Separator />

      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-8 px-4 text-center">
        <div className="flex flex-col items-center justify-start gap-4">
          <img
            src="/logo.svg"
            alt="logo"
            width={48}
            height={48}
            className="animate-spin-slow"
          />
          <h3 className="max-w-2xl text-3xl/none font-semibold [text-wrap:_balance] sm:text-4xl/none md:text-5xl/none">
            What are you waiting for?
          </h3>
          <p className="text-lg/none font-semibold opacity-75 md:text-xl/none">
            Buy today and start exploring the world of SaaS!
          </p>
        </div>

        <Button variant="secondary" asChild>
          <Link to="#top">
            <ArrowUp size={16} className="opacity-50" />
            <span>Back to top</span>
          </Link>
        </Button>
      </div> */}

      <Footer />
    </div>
  )
}
