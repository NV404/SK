import {
  Boxes,
  Coins,
  DollarSign,
  Gem,
  HeartHandshake,
  type LucideIcon,
  MapPinned,
  PiggyBank,
  Users2,
} from "lucide-react"

type FILTER = {
  type: string
  name: string
  title: string
  icon: LucideIcon
  url: string
}

export const FILTERS_CONST = [
  {
    type: "range",
    name: "revenue",
    title: "Revenue",
    icon: DollarSign,
    url: "/dashboard/api/options?name=revenue",
  },
  {
    type: "range",
    name: "mrr",
    title: "MRR",
    icon: Coins,
    url: "/dashboard/api/options?name=mrr",
  },
  {
    type: "range",
    name: "valuation",
    title: "Valuation",
    icon: Gem,
    url: "/dashboard/api/options?name=valuation",
  },
  {
    type: "range",
    name: "funding",
    title: "Funding",
    icon: PiggyBank,
    url: "/dashboard/api/options?name=funding",
  },
  {
    type: "range",
    name: "customersCount",
    title: "Customers Count",
    icon: Users2,
    url: "/dashboard/api/options?name=customersCount",
  },
  {
    type: "range",
    name: "teamSize",
    title: "Team Size",
    icon: HeartHandshake,
    url: "/dashboard/api/options?name=teamSize",
  },
  {
    type: "combobox",
    name: "countries",
    title: "Countries",
    icon: MapPinned,
    url: "/dashboard/api/options?name=countries",
  },
  {
    type: "combobox",
    name: "industries",
    title: "Categories",
    icon: Boxes,
    url: "/dashboard/api/options?name=industries",
  },
  {
    type: "combobox",
    name: "department",
    title: "Department",
    icon: Boxes,
    url: "/dashboard/api/options?name=department",
  },
] as const

export const FILTERS = FILTERS_CONST as unknown as FILTER[]

export const FILTER_OPTIONS_CONST = FILTERS_CONST.map((filter) => ({
  label: filter.title,
  value: filter.name,
}))

export const FILTER_OPTIONS = FILTERS.map((filter) => ({
  label: filter.title,
  value: filter.name,
}))

export const SORT_OPTIONS_CONST = [
  {
    label: "Name",
    value: "name",
  },
  ...FILTER_OPTIONS_CONST,
] as const

export const SORT_OPTIONS = [
  {
    label: "Name",
    value: "name",
  },
  ...FILTER_OPTIONS,
]

export const LIMIT_OPTIONS = [
  { label: "10", value: "10" },
  { label: "25", value: "25" },
  { label: "50", value: "50" },
  { label: "100", value: "100" },
  // { label: "250", value: "250" },
  // { label: "500", value: "500" },
  // { label: "1000", value: "1000" },
]
