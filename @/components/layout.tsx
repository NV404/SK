import { TabsContent } from "@radix-ui/react-tabs"
import { ActionFunction, LoaderFunction, json } from "@remix-run/node"
import {
  Form,
  Link,
  NavLink,
  useFetcher, // useFetcher,
  useLoaderData,
  useNavigate,
  useRouteLoaderData,
  useSearchParams,
} from "@remix-run/react"
import {
  Check,
  ChevronDown,
  Fingerprint,
  Home,
  LifeBuoy,
  LogOut,
  LucideAlignJustify,
  Search,
  Settings2,
  UserCircle2,
  Wallet,
} from "lucide-react"
import { useEffect, useState } from "react"
import { type loader as rootLoaderData } from "~/root"
import { type action as authenticationAction } from "~/routes/api.authentication"
import { type loader as authenticationLoader } from "~/routes/api.authentication"
import { type loader as directoryCompaniesLoader } from "~/routes/api.directory.companies"

// import { type action as authenticationAction } from "~/routes/api.authentication"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { User } from "@/db/schema"

import { Avatar } from "./ui/avatar"
import { Card } from "./ui/card"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from "./ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Input } from "./ui/input"
import { Separator } from "./ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet"
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs"
import { useToast } from "./ui/use-toast"

export function NavbarPublic() {
  const [searchParams] = useSearchParams()
  const isDefaultOpen = searchParams.get("login") === "true"
  // const loaderData = useLoaderData() as any

  // console.log(loaderData, "loaderData")

  // const authenticationFetcher = useFetcher<typeof authenticationAction>({
  //   key: "authentication",
  // })

  const { toast } = useToast()

  // useEffect(() => {
  //   if (authenticationFetcher.data && "error" in authenticationFetcher.data) {
  //     toast({
  //       variant: "destructive",
  //       title: "Error",
  //       description: authenticationFetcher.data.error.message,
  //     })
  //   }
  // }, [toast, authenticationFetcher.data])

  // const isOTPSent = Boolean(
  //   authenticationFetcher.data && "email" in authenticationFetcher.data,
  // )

  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [user, setUser] = useState<any>(undefined)

  const fetcher = useFetcher<typeof directoryCompaniesLoader>()
  const authenticationFetcher = useFetcher<typeof authenticationAction>({
    key: "authentication",
  })

  const userFetcher = useFetcher<typeof authenticationLoader>()

  useEffect(() => {
    userFetcher.load(`/api/authentication`)
  }, [])

  useEffect(() => {
    console.log(userFetcher.data, "userFetcher.data")
    if (userFetcher.data) {
      if (userFetcher.data?.user) {
        setUser(userFetcher.data.user)
      }
      if (
        userFetcher.data?.error &&
        userFetcher.data?.error === "User not found"
      ) {
        setUser(null)
      }
    }
  }, [userFetcher.data])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetcher.load(`/api/directory/companies?query=${searchQuery}`)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  return (
    <>
      <nav className="container hidden flex-row items-center justify-between gap-4 px-4 lg:flex">
        <div className="flex flex-grow items-center gap-3">
          <Link
            to="/"
            className="flex flex-grow flex-row items-center justify-start gap-2"
          >
            <img src="/saaskart_logo.png" alt="logo" width={150} />
          </Link>
          {/* <Command className="relative flex-grow overflow-visible rounded-lg border">
            <CommandInput
              placeholder="Search for products"
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="w-full"
            />
            <CommandList className="absolute left-0 top-14 z-50 w-full rounded-lg bg-white shadow-xl">
              <CommandEmpty>No results found.</CommandEmpty>
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
                    setSearchQuery("")
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
          </Command> */}
        </div>

        <div className="flex flex-row items-center justify-start gap-2">
          {/* <Button
          variant="secondary"
          size="sm"
          asChild
          className="[&.active]:hidden"
        >
          <NavLink to="/" end>
            <Home size={14} className="opacity-50" />
            <span className="sr-only">Home</span>
          </NavLink>
        </Button> */}

          <div className="group/level">
            <Button
              variant={"link"}
              className=" relative flex items-center gap-1"
            >
              Software <ChevronDown size={15} />
            </Button>
            <Card className="min-w-40 absolute hidden flex-col py-2 group-hover/level:flex">
              <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                <li>
                  <a
                    href="#"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    Sales
                  </a>
                </li>
                <li className="group/multi relative">
                  <button
                    id="doubleDropdownButton"
                    data-dropdown-toggle="doubleDropdown"
                    data-dropdown-placement="right-start"
                    type="button"
                    className="flex w-full items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    Marketing
                    <svg
                      className="ms-3 h-2.5 w-2.5 rtl:rotate-180"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 6 10"
                    >
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="m1 9 4-4-4-4"
                      />
                    </svg>
                  </button>
                  <Card className="min-w-60 absolute -top-5 left-[103%] hidden flex-col py-2 group-hover/multi:flex">
                    <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                      <li>
                        <a
                          href="#"
                          className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        >
                          Salesforce
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        >
                          Hubspot
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        >
                          All Products
                        </a>
                      </li>
                    </ul>
                  </Card>
                </li>
                <li>
                  <a
                    href="#"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    Tools
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    All category
                  </a>
                </li>
              </ul>
            </Card>
          </div>

          <Button variant={"link"}>Services</Button>

          <Button variant={"link"}>Solutions</Button>

          <Button variant={"link"}>Pricing</Button>

          <Button variant={"link"}>Resources</Button>

          <Button variant={"link"}>
            <Link to="/marketplace">Marketplace</Link>
          </Button>

          {user === undefined ? null : (
            <>
              {user !== null ? (
                <Link to="/dashboard/profile">
                  <div>
                    <UserCircle2 />
                  </div>
                </Link>
              ) : (
                <Dialog defaultOpen={isDefaultOpen}>
                  <DialogTrigger asChild>
                    <Button variant="hero" size="sm">
                      <Fingerprint size={14} className="opacity-50" />
                      <span>Login / Signup</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <fieldset>
                      <DialogHeader>
                        <DialogTitle>Login & signup</DialogTitle>
                        <DialogDescription>
                          Authenticate to start reviewing products.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col items-stretch justify-start gap-2">
                        <Tabs defaultValue="login">
                          <TabsList className="my-2 grid w-full grid-cols-2 shadow-sm">
                            <TabsTrigger value="login">Log In</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                          </TabsList>
                          <TabsContent
                            value="login"
                            className="flex flex-col items-stretch justify-start gap-2"
                          >
                            <Button variant={"outline"}>
                              Login with Google
                            </Button>
                            <Button variant={"outline"}>
                              Login with Linkedin
                            </Button>
                            <Separator className="m-2" />
                            <authenticationFetcher.Form
                              action="/api/authentication"
                              method="post"
                              className="flex w-full flex-col gap-2"
                            >
                              <p className="text-lg font-semibold">
                                Login using email
                              </p>
                              <Input
                                type="email"
                                name="email"
                                placeholder="Email"
                                required
                                autoFocus
                              />
                              <Input
                                type="password"
                                name="password"
                                placeholder="password"
                                required
                                autoFocus
                              />
                              <input
                                type="hidden"
                                name="action"
                                value="login"
                              />
                              <Button className="w-full" variant={"hero"}>
                                Log In
                              </Button>
                            </authenticationFetcher.Form>
                            <div>
                              {authenticationFetcher.data?.error ? (
                                <p className="text-center font-semibold text-red-500">
                                  ERROR: {authenticationFetcher.data?.error}
                                </p>
                              ) : null}
                            </div>
                          </TabsContent>
                          <TabsContent
                            value="signup"
                            className="flex flex-col items-stretch justify-start gap-2"
                          >
                            <Button variant={"outline"}>
                              Login with Google
                            </Button>
                            <Button variant={"outline"}>
                              Login with Linkedin
                            </Button>
                            <Separator className="m-2" />
                            <authenticationFetcher.Form
                              action="/api/authentication"
                              method="post"
                              className="flex w-full flex-col gap-2"
                            >
                              <p className="text-lg font-semibold">
                                Sign Up using email
                              </p>
                              <Input
                                type="email"
                                name="email"
                                placeholder="Email"
                                required
                                autoFocus
                              />
                              <Input
                                type="password"
                                name="password"
                                placeholder="password"
                                required
                                autoFocus
                              />
                              <input
                                type="hidden"
                                name="action"
                                value="signup"
                              />
                              {/* <Input
                            type="confirmPassword"
                            name="confirmPassword"
                            placeholder="password"
                            required
                            autoFocus
                          /> */}
                              <Button
                                className="w-full"
                                type="submit"
                                variant={"hero"}
                                disabled={
                                  authenticationFetcher.state !== "idle"
                                }
                              >
                                Sign Up
                              </Button>
                            </authenticationFetcher.Form>
                            <div>
                              {authenticationFetcher.data?.error ? (
                                <p className="text-center font-semibold text-red-500">
                                  ERROR: {authenticationFetcher.data?.error}
                                </p>
                              ) : null}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </fieldset>
                  </DialogContent>
                </Dialog>
              )}
            </>
          )}
        </div>
      </nav>
      <nav className="container flex flex-row items-center justify-between gap-4 px-4 lg:hidden">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex flex-row items-center justify-start gap-2"
          >
            <img src="/saaskart_logo.png" alt="logo" width={150} />
          </Link>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant={"secondary"}>
              <LucideAlignJustify />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <Command className="relative overflow-visible rounded-lg border">
                <CommandInput
                  placeholder="Search for products"
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  className="w-full"
                />
                <CommandList className="absolute left-0 top-14 z-50 w-full rounded-lg bg-white shadow-xl">
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
                        setSearchQuery("")
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
              </Command>
            </SheetHeader>
            <div className="flex flex-col items-start justify-start gap-4 py-5">
              {/* <Button
          variant="secondary"
          size="sm"
          asChild
          className="[&.active]:hidden"
        >
          <NavLink to="/" end>
            <Home size={14} className="opacity-50" />
            <span className="sr-only">Home</span>
          </NavLink>
        </Button> */}

              <Button variant={"link"}>Software</Button>
              <Separator />
              <Button variant={"link"}>Services</Button>
              <Separator />
              <Button variant={"link"}>Solutions</Button>
              <Separator />
              <Button variant={"link"}>Pricing</Button>
              <Separator />
              <Button variant={"link"}>Resources</Button>
              <Separator />
              <Button variant={"link"}>Marketplace</Button>
            </div>
            <SheetFooter>
              <Dialog defaultOpen={isDefaultOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="sm">
                    <Fingerprint size={14} className="opacity-50" />
                    <span>Login</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form
                    // action="/api/authentication"
                    method="post"
                    className="contents"
                  >
                    <fieldset>
                      <DialogHeader>
                        <DialogTitle>Login</DialogTitle>
                        <DialogDescription>
                          Authenticate with the email you used to buy the
                          product.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col items-stretch justify-start gap-2">
                        <Button variant={"outline"}>Login with Google</Button>
                        <Button variant={"outline"}>Login with Linkedin</Button>
                        <Separator className="m-2" />
                        <Button variant={"secondary"}>
                          Use Business Email
                        </Button>
                      </div>
                    </fieldset>
                  </form>
                </DialogContent>
              </Dialog>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </nav>
    </>
  )
}

export function NavbarDashboard() {
  const loaderData = useRouteLoaderData<typeof rootLoaderData>("root")

  if (!loaderData?.user) return null

  return (
    <nav className="container flex flex-row items-center justify-between gap-4 px-4">
      <Link to="/" className="flex flex-row items-center justify-start gap-2">
        <img src="/logo.svg" alt="logo" width={20} height={20} />
        <span className="text-xl/none font-bold">saaskart</span>
      </Link>

      <Form id="logoutForm" action="/logout" method="post" />

      <div className="flex flex-row items-center justify-start gap-2">
        <Button
          variant="secondary"
          size="sm"
          asChild
          className="[&.active]:hidden"
        >
          <NavLink to="/dashboard" end>
            <Home size={14} className="opacity-50" />
            <span className="sr-only">Home</span>
          </NavLink>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="sm">
              <Settings2 size={14} className="opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col items-stretch justify-start gap-2">
                <div className="flex flex-col items-stretch justify-start gap-2">
                  <p className="text-sm/none font-medium">
                    {loaderData.user.email}
                  </p>
                  {/* <p className="text-xs/none opacity-75">
                    {loaderData.user.isLifetime
                      ? "Lifetime"
                      : loaderData.user.subscriptionId
                        ? "Subscription"
                        : "Unknown"}
                  </p> */}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to="/dashboard">
                  <Home size={14} className="opacity-50" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              {/* {loaderData.user.subscriptionId ? (
                <DropdownMenuItem asChild>
                  <Link
                    to="https://buy.saasdata.app/billing"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Wallet size={14} className="opacity-50" />
                    <span>Billing</span>
                  </Link>
                </DropdownMenuItem>
              ) : null} */}
              <DropdownMenuItem asChild>
                <Link to="/legal#contact">
                  <LifeBuoy size={14} className="opacity-50" />
                  <span>Support</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <button type="submit" form="logoutForm" className="w-full">
                <LogOut size={14} className="opacity-50" />
                <span>Logout</span>
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}

export function Footer() {
  return (
    <footer className="container flex flex-col items-stretch justify-start gap-4 border-t border-border pt-4 sm:pt-8">
      <div className="flex flex-row flex-wrap items-center justify-center gap-2">
        <p className="text-sm opacity-75">
          &copy; SaasKart, {new Date().getFullYear()}
        </p>
      </div>
      <div className="flex flex-row flex-wrap items-center justify-center gap-4">
        <Button asChild variant="link" size="xs" noPadding>
          <Link to="/legal#contact">Contact</Link>
        </Button>
        <Button asChild variant="link" size="xs" noPadding>
          <Link to="/legal#privacy">Privacy Policy</Link>
        </Button>
        <Button asChild variant="link" size="xs" noPadding>
          <Link to="/legal#terms">Terms</Link>
        </Button>
      </div>
    </footer>
  )
}
