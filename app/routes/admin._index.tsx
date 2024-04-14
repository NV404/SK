import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node"
import { Form, Link, useLoaderData } from "@remix-run/react"
import { count, eq } from "drizzle-orm"
import {
  Activity,
  ArrowUpRight,
  BuildingIcon,
  CreditCard,
  DollarSign,
  FileQuestion,
  Menu,
  Package2,
  Search,
  Settings,
  User,
  UserCircle2,
  Users,
} from "lucide-react"
import { useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { getUser } from "@/lib/session.server"

import { db, schema } from "@/db/index.server"
import { Claim, claims, companies } from "@/db/schema"

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request)

  if (!user) {
    return redirect("/")
  }

  if (user.isAdmin === false) {
    return redirect("/")
  }

  const [allCompanies] = await db.select({ count: count() }).from(companies)
  const [claimedCompanies] = await db
    .select({ count: count() })
    .from(companies)
    .where(eq(companies.claimed_status, "claimed"))
  const [unclaimedCompanies] = await db
    .select({ count: count() })
    .from(companies)
    .where(eq(companies.claimed_status, "unclaimed"))

  const claimRequests = await db.query.claims.findMany({
    with: {
      user: true,
      company: true,
    },
  })

  // console.log(claimRequests, "claimRequests")

  return {
    user,
    allCompanies,
    claimedCompanies,
    unclaimedCompanies,
    claimRequests,
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData()
  const action = form.get("action")

  if (action === "denyClaim") {
    const claimId = form.get("claimId") as string
    const deletedClaim = await db
      .delete(claims)
      .where(eq(claims.id, claimId))
      .returning()
    if (deletedClaim) {
      return { data: "success" }
    }
  }

  if (action === "acceptClaim") {
    const claimId = form.get("claimId") as string
    const [deletedClaim] = await db
      .delete(claims)
      .where(eq(claims.id, claimId))
      .returning()
    if (deletedClaim) {
      const updateCompany = await db
        .update(companies)
        .set({ managerId: deletedClaim.userId, claimed_status: "claimed" })
      return { data: "success" }
    }
  }
}

export default function Dashboard() {
  const loaderData = useLoaderData<typeof loader>()
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            to="#"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <Package2 className="h-6 w-6" />
            <span className="sr-only">Saaskart</span>
          </Link>
          <Link
            to="#"
            className="text-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            to="#"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Companies
          </Link>
          <Link
            to="#"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Claims
          </Link>
          <Link
            to="#"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Queries
          </Link>
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                to="#"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <Package2 className="h-6 w-6" />
                <span className="sr-only">Saaskart</span>
              </Link>
              <Link to="#" className="hover:text-foreground">
                Dashboard
              </Link>
              <Link
                to="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Companies
              </Link>
              <Link
                to="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Claims
              </Link>
              <Link
                to="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Queries
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <form className="ml-auto flex-1 sm:flex-initial">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              />
            </div>
          </form>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <UserCircle2 className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card x-chunk="dashboard-01-chunk-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Companies
              </CardTitle>
              <BuildingIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loaderData.allCompanies.count}
              </div>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Unclaimed Companies
              </CardTitle>
              <BuildingIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loaderData.unclaimedCompanies.count}
              </div>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Claimed Companies
              </CardTitle>
              <BuildingIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loaderData.claimedCompanies.count}
              </div>
              {/* <p className="text-xs text-muted-foreground">
                +201 since last hour
              </p> */}
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Queries</CardTitle>
              <FileQuestion className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              {/* <p className="text-xs text-muted-foreground">
                +19% from last month
              </p> */}
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Claims</CardTitle>
                <CardDescription>
                  Recent claims to your Companies.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <Link to="#">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden xl:table-column">
                      Type
                    </TableHead>
                    <TableHead className="hidden xl:table-column">
                      Status
                    </TableHead>
                    <TableHead className="hidden xl:table-column">
                      Date
                    </TableHead>
                    <TableHead className="text-right">Company</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loaderData.claimRequests.map((request: any) => (
                    <ClaimCard request={request} />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-5">
            <CardHeader>
              <CardTitle>Recent Queries</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-8">
              <div className="flex h-40 w-full items-center justify-center">
                <p>No queries</p>
              </div>
              {/* <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/01.png" alt="Avatar" />
                  <AvatarFallback>OM</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Olivia Martin
                  </p>
                  <p className="text-sm text-muted-foreground">
                    olivia.martin@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium">Hubspot</div>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/02.png" alt="Avatar" />
                  <AvatarFallback>JL</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Jackson Lee
                  </p>
                  <p className="text-sm text-muted-foreground">
                    jackson.lee@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium">Hubspot</div>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/03.png" alt="Avatar" />
                  <AvatarFallback>IN</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Isabella Nguyen
                  </p>
                  <p className="text-sm text-muted-foreground">
                    isabella.nguyen@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium">Hubspot</div>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/04.png" alt="Avatar" />
                  <AvatarFallback>WK</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    William Kim
                  </p>
                  <p className="text-sm text-muted-foreground">
                    will@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium">Hubspot</div>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/05.png" alt="Avatar" />
                  <AvatarFallback>SD</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Sofia Davis
                  </p>
                  <p className="text-sm text-muted-foreground">
                    sofia.davis@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium">Hubspot</div>
              </div>*/}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

const ClaimCard = ({ request }: { request: any }) => {
  const [isClaimDetails, setClaimDetails] = useState(false)
  return (
    <Dialog>
      <TableRow>
        <TableCell>
          <div className="font-medium">
            {request.user?.name || "saaskart user"}
          </div>
          <div className="hidden text-sm text-muted-foreground md:inline">
            {request.user?.email}
          </div>
        </TableCell>
        <TableCell className="hidden xl:table-column">Sale</TableCell>
        <TableCell className="hidden xl:table-column">
          <Badge className="text-xs" variant="outline">
            Approved
          </Badge>
        </TableCell>
        <TableCell className="hidden md:table-cell lg:hidden xl:table-column">
          2023-06-23
        </TableCell>
        <TableCell className="text-right">
          <div className="item flex justify-end gap-2">
            {request.company.name}
            <DialogTrigger>
              <Settings />
            </DialogTrigger>
          </div>
        </TableCell>
      </TableRow>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Claim Request</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Card>
            <CardContent className="flex flex-col gap-2">
              <p className="my-3 flex items-center gap-2 font-bold">
                <User /> User Details
              </p>
              <div className="flex flex-col gap-2">
                <p>
                  <span className="font-semibold">Name:</span>{" "}
                  {request.user?.name || "saaskart user"}
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  {request.user?.email}
                </p>
                <p>
                  <span className="font-semibold">Number:</span>{" "}
                  {request.user?.phoneNumber}
                </p>
                <p>
                  <span className="font-semibold">Linkedin:</span>{" "}
                  <a href={request.user?.linkedinLink}>
                    {request.user?.linkedinLink}
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col gap-2">
              <p className="my-3 flex items-center gap-2 font-bold">
                <BuildingIcon /> Company Details
              </p>
              <div className="flex flex-col gap-2">
                <p>
                  <span className="font-semibold">Name:</span>{" "}
                  {request.company?.name}
                </p>
                <p>
                  <span className="font-semibold">Website:</span>{" "}
                  <a href={request.company?.domain as any}>
                    {request.company?.domain}
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        <DialogFooter>
          <div className="flex items-center gap-3">
            <Form method="post">
              <Button variant={"hero"}>Approve</Button>
              <input type="hidden" name="claimId" value={request.id} />
              <input type="hidden" name="action" value="acceptClaim" />
            </Form>
            <Form method="post">
              <Button variant={"outline"}>Deny</Button>
              <input type="hidden" name="claimId" value={request.id} />
              <input type="hidden" name="action" value="denyClaim" />
            </Form>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
