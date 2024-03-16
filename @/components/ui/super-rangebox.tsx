import { useEffect, useMemo, useState } from "react"

import { type LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button, type ButtonProps } from "@/components/ui/button"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

import { useOFetcher } from "@/lib/ofetch"
import {
  type SingleFormatterType,
  type RangeFormatterType,
  getRangeValueFromConfig,
  formatNumber,
} from "@/lib/utils"
import { Slider } from "./slider"

export type SuperRangeboxConfig = {
  min: number
  max: number
}

export type SuperRangeboxValue = {
  min: number
  max: number
}

export type SuperRangeboxProps = {
  name?: string

  title: string
  icon?: LucideIcon
  formatter?: RangeFormatterType
  formatterSingle?: SingleFormatterType

  config?: SuperRangeboxConfig

  fetch?: string
  defaultValue?: SuperRangeboxValue

  triggerButtonProps?: ButtonProps

  onValueChange?: (value: SuperRangeboxValue) => void
}

export function SuperRangebox({
  name,

  title,
  icon: Icon,
  formatter = ({ min, max }) => formatNumber([min, max]),
  formatterSingle = (value) => formatNumber(value),

  config: _config = {
    min: 0,
    max: 100,
  },

  fetch,
  defaultValue: _defaultValue,

  triggerButtonProps,

  onValueChange,
}: SuperRangeboxProps) {
  const [config, setConfig] = useState<SuperRangeboxConfig>(_config)
  const defaultValue = useMemo(() => {
    return _defaultValue ? _defaultValue : config
  }, [_defaultValue, config])
  const [value, setValue] = useState<SuperRangeboxValue>(defaultValue)

  const fetcher = useOFetcher<SuperRangeboxConfig>()

  useEffect(() => {
    if (fetch && !fetcher.loading && !fetcher.error) {
      if (fetcher.data) {
        if (
          fetcher.data.min !== config.min ||
          fetcher.data.max !== config.max
        ) {
          setConfig({ ...fetcher.data })
          setValue({ ...fetcher.data })
        }
      } else {
        fetcher.load(fetch)
      }
    }
  }, [fetch, fetcher, config])

  useEffect(() => {
    onValueChange?.(value)
  }, [value, onValueChange])

  // const emptyValues = useCallback(() => {
  //   setValue(() => {
  //     return defaultValue
  //   })
  // }, [defaultValue])

  return (
    <div className="contents">
      {name ? (
        <>
          <input
            type="text"
            name={name}
            value={getRangeValueFromConfig(value)}
            readOnly
            hidden
          />
        </>
      ) : null}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="border-dashed"
            disabled={fetcher.loading}
            {...triggerButtonProps}
          >
            {Icon ? <Icon size={14} className="opacity-50" /> : null}
            {title}

            <Separator orientation="vertical" className="h-1/2" />
            <Badge variant="ghost" className="rounded-sm px-1 font-normal">
              {formatter(value)}
            </Badge>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="flex w-[200px] flex-col items-stretch justify-start gap-4 p-4"
          align="start"
        >
          <div className="flex flex-row items-center justify-between gap-2">
            <p className="text-sm leading-none opacity-75">
              {formatterSingle(value.min)}
            </p>
            <p className="text-sm leading-none opacity-75">
              {formatterSingle(value.max)}
            </p>
          </div>

          <Slider
            // defaultValue={[defaultValue.min, defaultValue.max]}
            min={config.min}
            max={config.max}
            // step={(config.min + config.max) / 12}
            value={[value.min, value.max]}
            onValueChange={(newValue) =>
              setValue({
                min: newValue[0],
                max: newValue[1],
              })
            }
          />

          {/* {defaultValue !== value ? (
            <Button variant="ghost" size="xs" onClick={emptyValues}>
              Reset
            </Button>
          ) : null} */}
        </PopoverContent>
      </Popover>
    </div>
  )
}
