import { Link, useFetcher, useNavigate } from "@remix-run/react"
import { Boxes, MapPinned, Search } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from "@/components/ui/command"

import * as gtag from "@/lib/gtags.client"

import { type loader as directoryCompaniesLoader } from "./api.directory.companies"

export default function DirectoryHome() {
  const navigate = useNavigate()

  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const fetcher = useFetcher<typeof directoryCompaniesLoader>()

  useEffect(() => {
    const timer = setTimeout(() => {
      fetcher.load(`/api/directory/companies?query=${searchQuery}`)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    if (fetcher.state !== "idle" && searchQuery) {
      gtag.event({
        action: "search",
        category: "directory",
        label: searchQuery,
      })
    }
  }, [searchQuery, fetcher.state, fetcher.formData])

  return (
    <div className="container flex flex-col flex-wrap items-stretch justify-start gap-4 px-4">
      <h1 className="sr-only">Directory</h1>

      <div className="mx-auto flex min-h-[50vh] w-full max-w-sm flex-col items-stretch justify-center gap-2">
        <Button variant="hero" onClick={() => setIsSearchOpen(true)}>
          <Search size={16} className="opacity-50" />
          <span>Search</span>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/directory/countries">
            <MapPinned size={16} className="opacity-50" />
            <span>All Countries</span>
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/directory/industries">
            <Boxes size={16} className="opacity-50" />
            <span>All Industries</span>
          </Link>
        </Button>
      </div>

      <CommandDialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <CommandInput
          placeholder="Search companies..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          {/* <CommandEmpty>No results found.</CommandEmpty> */}
          {fetcher.state === "loading" ? (
            <CommandLoading>Loading...</CommandLoading>
          ) : null}
          {(fetcher.data ?? []).map((company) => (
            <CommandItem
              key={company.id}
              value={company.name}
              className="gap-2"
              onSelect={() => {
                navigate(`/companies/${company.id}`)
              }}
            >
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={`${company.name} logo`}
                  width={16}
                  height={16}
                />
              ) : (
                <div className="h-4 w-4"></div>
              )}
              <span>{company.name}</span>
            </CommandItem>
          ))}
        </CommandList>
      </CommandDialog>
    </div>
  )
}
