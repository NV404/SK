import { Link, useFetcher } from "@remix-run/react"
import {
  ArrowUpDown,
  Boxes,
  CircleOff,
  Coins,
  DollarSign,
  Filter,
  Gem,
  HashIcon,
  HeartHandshake,
  LinkIcon,
  Linkedin,
  type LucideIcon,
  MapPinned,
  PiggyBank,
  Search,
  SearchSlash,
  TrendingDown,
  TrendingUp,
  Twitter,
  Users2,
  Youtube,
} from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SuperCombobox } from "@/components/ui/super-combobox"
import { SuperRangebox } from "@/components/ui/super-rangebox"

import * as gtag from "@/lib/gtags.client"
import { formatNumber } from "@/lib/utils"

import {
  FILTERS,
  FILTER_OPTIONS,
  LIMIT_OPTIONS,
  SORT_OPTIONS,
} from "@/config/options"

import { type loader as companiesLoader } from "./dashboard.api.companies"

export default function DashboardIndex() {
  const [activeFilterValues, setActiveFilterValues] = useState<
    (typeof FILTER_OPTIONS)[number]["value"][]
  >([])

  const fetcher = useFetcher<typeof companiesLoader>()

  useEffect(() => {
    if (fetcher.state !== "idle" && fetcher.formData) {
      gtag.event({
        action: "search",
        category: "dashboard",
        label: new URLSearchParams(fetcher.formData as any).toString(),
      })
    }
  }, [fetcher.state, fetcher.formData])

  return (
    <div className="container flex flex-col items-stretch justify-start gap-8 px-4">
      <fetcher.Form
        method="get"
        action="/dashboard/api/companies"
        className="flex flex-col items-stretch justify-start gap-2"
      >
        <fieldset className="contents" disabled={fetcher.state !== "idle"}>
          <div className="flex flex-row items-center justify-between gap-2">
            <Input
              type="search"
              name="query"
              placeholder="Query by company name or description..."
              autoComplete="off"
              autoFocus
            />
            <Button type="submit" variant="hero">
              <Search size={16} />
              <span>Search</span>
            </Button>
          </div>
          <div className="flex flex-row flex-wrap items-center justify-start gap-2">
            <SuperCombobox
              name="limit"
              title="Limit"
              icon={HashIcon}
              options={LIMIT_OPTIONS}
              defaultValues={["25"]}
              multiple={false}
              required
              showTitle={false}
              triggerButtonProps={{
                variant: "secondary",
                size: "xs",
              }}
            />
            <SuperCombobox
              name="sort"
              title="Sort by"
              icon={ArrowUpDown}
              multiple={false}
              required
              options={SORT_OPTIONS}
              defaultValues={["revenue"]}
              triggerButtonProps={{
                variant: "secondary",
                size: "xs",
              }}
            />
            <SuperCombobox
              name="filters"
              title="Filters"
              icon={Filter}
              options={FILTER_OPTIONS}
              defaultValues={["countries", "revenue"]}
              triggerButtonProps={{
                variant: "secondary",
                size: "xs",
              }}
              onValuesChange={setActiveFilterValues}
            />

            {activeFilterValues.length ? (
              <Separator orientation="vertical" className="h-4" />
            ) : null}

            {activeFilterValues.map((activeFilterValue) => {
              const filter = FILTERS.find(
                (_filter) => _filter.name === activeFilterValue,
              )

              if (filter) {
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

              return null
            })}
          </div>
        </fieldset>
      </fetcher.Form>

      <Separator orientation="horizontal" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {fetcher.data ? (
          fetcher.data.companies.length === 0 ? (
            <div className="col-span-2 flex min-h-[50vh] flex-col items-center justify-center gap-4">
              <SearchSlash size={32} className="opacity-50" />
              <p className="text-center text-sm opacity-75">
                No results found for this query.
              </p>
            </div>
          ) : (
            fetcher.data.companies.map((company) => {
              return (
                <Link
                  key={company.id}
                  to={`/companies/${company.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-stretch justify-start gap-4 rounded-lg border border-border p-4 hover:bg-secondary"
                >
                  <div className="flex flex-row items-center justify-start gap-4">
                    {company.logo ? (
                      <img
                        src={company.logo}
                        alt=""
                        width={24}
                        height={24}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <CircleOff size={24} />
                    )}

                    <p className="text-base/none font-semibold">
                      {company.name}
                    </p>
                  </div>

                  <div className="flex flex-row flex-wrap items-center justify-start gap-4">
                    <Info icon={LinkIcon} value={company.domain} />
                    {company.socials?.linkedIn ? (
                      <Info icon={Linkedin} />
                    ) : null}
                    {company.socials?.twitter ? <Info icon={Twitter} /> : null}
                    {company.socials?.youtube ? <Info icon={Youtube} /> : null}
                  </div>

                  <div className="flex flex-row flex-wrap items-center justify-start gap-4">
                    {company.country ? (
                      <Info icon={MapPinned} value={company.country} />
                    ) : null}
                    {company.industry ? (
                      <Info icon={Boxes} value={company.industry.name} />
                    ) : null}
                  </div>

                  <div className="flex flex-row flex-wrap items-center justify-start gap-4">
                    {company.metrics?.revenue ? (
                      <Info
                        icon={DollarSign}
                        label="Revenue"
                        value={formatNumber(
                          Number(company.metrics.revenue),
                          true,
                        )}
                      />
                    ) : null}
                    {company.metrics?.mrr ? (
                      <Info
                        icon={Coins}
                        label="MRR"
                        value={formatNumber(Number(company.metrics.mrr), true)}
                      />
                    ) : null}
                    {company.metrics?.valuation ? (
                      <Info
                        icon={Gem}
                        label="Valuation"
                        value={formatNumber(
                          Number(company.metrics.valuation),
                          true,
                        )}
                      />
                    ) : null}
                  </div>

                  <div className="flex flex-row flex-wrap items-center justify-start gap-4">
                    {company.metrics?.funding ? (
                      <Info
                        icon={PiggyBank}
                        label="Funding"
                        value={formatNumber(
                          Number(company.metrics.funding),
                          true,
                        )}
                      />
                    ) : null}
                    {company.metrics?.profitable ? (
                      Number(company.metrics.profitable) >= 0 ? (
                        <Info icon={TrendingUp} label="Profitable" />
                      ) : (
                        <Info icon={TrendingDown} label="In Loss" />
                      )
                    ) : null}
                  </div>

                  <div className="flex flex-row flex-wrap items-center justify-start gap-4">
                    {company.metrics?.customersCount ? (
                      <Info
                        icon={Users2}
                        label="Customer Count"
                        value={formatNumber(
                          Number(company.metrics.customersCount),
                        )}
                      />
                    ) : null}
                    {company.metrics?.teamSize ? (
                      <Info
                        icon={HeartHandshake}
                        label="Team Size"
                        value={formatNumber(Number(company.metrics.teamSize))}
                      />
                    ) : null}
                  </div>

                  <p className="mt-auto text-xs opacity-75">
                    Details of{" "}
                    <span className="font-medium">
                      {company.founders.length} person
                    </span>{" "}
                    available including{" "}
                    <span className="font-medium opacity-100">
                      {
                        company.founders.filter(
                          (founder) => founder.personalEmail,
                        ).length
                      }{" "}
                      personal
                    </span>{" "}
                    &{" "}
                    <span className="font-medium opacity-100">
                      {
                        company.founders.filter((founder) => founder.email)
                          .length
                      }{" "}
                      professional emails.
                    </span>
                  </p>
                </Link>
              )
            })
          )
        ) : (
          <div className="col-span-2 flex min-h-[50vh] flex-col items-center justify-center gap-4">
            <Search size={32} className="opacity-50" />
            <p className="text-center text-sm opacity-75">
              Start searching to see results here.
            </p>
          </div>
        )}
      </div>

      <Separator orientation="horizontal" />
    </div>
  )
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon?: LucideIcon
  label?: string
  value?: string
}) {
  return (
    <div className="flex flex-row items-center justify-start gap-2">
      <div className="flex flex-row items-center justify-start gap-1">
        {Icon ? <Icon size={12} className="opacity-50" /> : null}
        {label ? <p className="text-xs/none opacity-50">{label}</p> : null}
      </div>
      {value ? <p className="text-xs/none">{value}</p> : null}
    </div>
  )
}
