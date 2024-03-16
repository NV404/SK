import {
  Form,
  Link,
  NavLink,
  useFetcher,
  useRouteLoaderData,
  useSearchParams,
} from "@remix-run/react"
import {
  Check,
  Fingerprint,
  Home,
  LifeBuoy,
  LogOut,
  Settings2,
  Wallet,
} from "lucide-react"
import { useEffect } from "react"
import { type loader as rootLoaderData } from "~/root"
import { type action as authenticationAction } from "~/routes/api.authentication"

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
import { useToast } from "./ui/use-toast"

export function NavbarPublic() {
  const [searchParams] = useSearchParams()
  const isDefaultOpen = searchParams.get("login") === "true"

  const authenticationFetcher = useFetcher<typeof authenticationAction>({
    key: "authentication",
  })

  const { toast } = useToast()

  useEffect(() => {
    if (authenticationFetcher.data && "error" in authenticationFetcher.data) {
      toast({
        variant: "destructive",
        title: "Error",
        description: authenticationFetcher.data.error.message,
      })
    }
  }, [toast, authenticationFetcher.data])

  const isOTPSent = Boolean(
    authenticationFetcher.data && "email" in authenticationFetcher.data,
  )

  return (
    <nav className="container flex flex-row items-center justify-between gap-4 px-4">
      <Link to="/" className="flex flex-row items-center justify-start gap-2">
        <img src="/saaskart_logo.jpg" alt="logo" width={150} />
      </Link>

      <div className="flex flex-row items-center justify-start gap-2">
        <Button
          variant="secondary"
          size="sm"
          asChild
          className="[&.active]:hidden"
        >
          <NavLink to="/" end>
            <Home size={14} className="opacity-50" />
            <span className="sr-only">Home</span>
          </NavLink>
        </Button>

        <Dialog defaultOpen={isDefaultOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm">
              <Fingerprint size={14} className="opacity-50" />
              <span>Login</span>
            </Button>
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
                    Authenticate with the email you used to buy the product.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-stretch justify-start gap-2">
                  <Button variant={"outline"}>Login with Google</Button>
                  <Button variant={"outline"}>Login with Linkedin</Button>
                  <Separator className="m-2" />
                  <Button variant={"secondary"}>Use Business Email</Button>
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
      </div>
    </nav>
  )
}

export function NavbarDashboard() {
  const loaderData = useRouteLoaderData<typeof rootLoaderData>("root")

  if (!loaderData?.user) return null

  return (
    <nav className="container flex flex-row items-center justify-between gap-4 px-4">
      <Link to="/" className="flex flex-row items-center justify-start gap-2">
        <img src="/logo.svg" alt="logo" width={20} height={20} />
        <span className="text-xl/none font-bold">SaaSData</span>
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
                  <p className="text-xs/none opacity-75">
                    {loaderData.user.isLifetime
                      ? "Lifetime"
                      : loaderData.user.subscriptionId
                        ? "Subscription"
                        : "Unknown"}
                  </p>
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
              {loaderData.user.subscriptionId ? (
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
              ) : null}
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
