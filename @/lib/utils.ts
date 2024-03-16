import { type ClassValue, clsx } from "clsx"
import qs from "querystring"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function searchParamsToObject(searchParams: URLSearchParams) {
  return qs.parse(searchParams.toString())
}

export function formDataToObject(formData: FormData) {
  return searchParamsToObject(
    new URLSearchParams(
      [...formData.entries()].map((entry) => [entry[0], entry[1].toString()]),
    ),
  )
}

export function formatNumber(
  input: number | [number, number],
  currency: boolean = false,
) {
  const formatter = Intl.NumberFormat("en-US", {
    ...(currency
      ? {
          style: "currency",
          currency: "USD",
        }
      : {}),
    notation: "compact",
  })

  return typeof input === "object"
    ? formatter.formatRange(...input)
    : formatter.format(input)
}

export function generateRange(min: number, max: number, count: number = 5) {
  return Array.from(
    { length: count },
    (_, i) => min + i * parseInt(((max - min) / (count - 1)).toFixed()),
  )
}

export type SingleFormatterType = (value: number) => string
export type RangeFormatterType = (config: RangeConfig) => string

export function generateOptionsFromRange(
  _range: number[],
  getLabel: RangeFormatterType = ({ min, max }) => formatNumber([min, max]),
) {
  const range = _range.filter((current) => current !== 0)

  return range.map((current, index) => {
    const [min, max] = [index === 0 ? 0 : range[index - 1], current]
    return {
      value: getRangeValueFromConfig({
        min,
        max,
      }),
      label: getLabel({ min, max }),
    }
  })
}

export type RangeConfig = {
  min: number
  max: number
}
export type RangeValue = `${number}-${number}` | string

export function getRangeValueFromConfig(config: RangeConfig): RangeValue {
  return `${config.min}-${config.max}`
}

export function getRangeConfigFromValue(value: RangeValue): RangeConfig | null {
  const [rawMin, rawMax] = value.split("-")

  if (!rawMin || !rawMax) return null

  const [min, max] = [Number(rawMin), Number(rawMax)]

  if (isNaN(min) || isNaN(max)) return null

  return {
    min,
    max,
  }
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (result, current) => {
      const value = current[key] as string
      result[value] = [...(result[value] || []), current]

      return result
    },
    {} as Record<string, T[]>,
  )
}

export function getRandom(max: number = 100) {
  return Math.round(Math.random() * max)
}

export function scaleRange(values: number[], r1: number[], r2: number[]) {
  return values.map((value) => {
    return ((value - r1[0]) * (r2[1] - r2[0])) / (r1[1] - r1[0]) + r2[0]
  })
}
