import { Check, type LucideIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button, type ButtonProps } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

import { useOFetcher } from "@/lib/ofetch"
import { cn } from "@/lib/utils"

export type SuperComboboxOption = {
  label: string
  value: string
  icon?: LucideIcon
}

export type SuperComboboxProps = {
  name?: string
  required?: boolean
  multiple?: boolean

  title: string
  icon?: LucideIcon

  fetch?: string
  defaultValues?: SuperComboboxOption["value"][]
  options?: SuperComboboxOption[]

  showTitle?: boolean
  triggerButtonProps?: ButtonProps

  onValuesChange?: (values: SuperComboboxOption["value"][]) => void
}

export function SuperCombobox({
  name,
  required = false,
  multiple = true,

  title,
  icon: Icon,

  fetch,
  defaultValues = [],
  options: _options = [],

  showTitle = true,
  triggerButtonProps,

  onValuesChange,
}: SuperComboboxProps) {
  const [options, setOptions] = useState(_options)
  const [selectedValues, setSelectedValues] = useState<
    SuperComboboxOption["value"][]
  >(
    required && defaultValues.length === 0
      ? _options.length === 0
        ? []
        : [_options[0].value]
      : defaultValues,
  )

  const fetcher = useOFetcher<SuperComboboxOption[]>()

  useEffect(() => {
    if (fetch && !fetcher.loading && !fetcher.error) {
      if (fetcher.data) {
        if (fetcher.data !== options) {
          setOptions(fetcher.data)
        }
      } else {
        fetcher.load(fetch)
      }
    }
  }, [fetch, fetcher, options])

  useEffect(() => {
    onValuesChange?.(selectedValues)
  }, [selectedValues, onValuesChange])

  const toggleOption = useCallback(
    (value: SuperComboboxOption["value"]) => {
      setSelectedValues((prevValues) => {
        const isSelected = prevValues.includes(value)

        if (required && prevValues.length <= 1 && prevValues.includes(value)) {
          return prevValues
        }

        if (multiple) {
          return isSelected
            ? prevValues.filter((prevValue) => prevValue !== value)
            : [...prevValues, value]
        } else {
          return isSelected ? [] : [value]
        }
      })
    },
    [required, multiple],
  )

  const emptyValues = useCallback(() => {
    setSelectedValues(() => {
      if (required) {
        return defaultValues.length === 0
          ? options.length === 0
            ? []
            : [options[0].value]
          : defaultValues
      }

      return []
    })
  }, [defaultValues, options, required])

  return (
    <div className="contents">
      {name ? (
        <>
          {selectedValues.map((selectedValue) => (
            <input
              key={selectedValue}
              type="text"
              name={name}
              value={selectedValue}
              readOnly
              hidden
            />
          ))}
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
            {showTitle ? title : null}
            {selectedValues.length > 0 && (
              <>
                {title || Icon ? (
                  <Separator orientation="vertical" className="h-1/2" />
                ) : null}
                <Badge
                  variant="ghost"
                  className="rounded-sm px-1 font-normal md:hidden"
                >
                  {multiple && !required
                    ? selectedValues.length
                    : options.find(
                        (option) => option.value === selectedValues[0],
                      )?.label}
                </Badge>
                <div className="hidden space-x-1 md:flex">
                  {selectedValues.length > 1 ? (
                    <Badge
                      variant="ghost"
                      className="rounded-sm px-1 font-normal"
                    >
                      {selectedValues.length}
                    </Badge>
                  ) : (
                    options
                      .filter((option) => selectedValues.includes(option.value))
                      .map((option) => (
                        <Badge
                          variant="ghost"
                          key={option.value}
                          className="rounded-sm px-1 font-normal text-current"
                        >
                          {option.label}
                        </Badge>
                      ))
                  )}
                </div>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput placeholder={title} />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = selectedValues.includes(option.value)
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => {
                        toggleOption(option.value)
                      }}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible",
                        )}
                      >
                        <Check className={cn("h-4 w-4")} />
                      </div>
                      {option.icon && (
                        <option.icon size={14} className="mr-2 opacity-50" />
                      )}
                      <span>{option.label}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
              {selectedValues.length > 0 ? (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => emptyValues()}
                      className="justify-center text-center"
                    >
                      {required ? "Reset" : "Clear"}
                    </CommandItem>
                  </CommandGroup>
                </>
              ) : null}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
