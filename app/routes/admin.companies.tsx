import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node"
import { Form, Link, useLoaderData } from "@remix-run/react"
import { count, eq } from "drizzle-orm"
import { BuildingIcon, Menu, Package2, Search, UserCircle2 } from "lucide-react"
import { toast } from "sonner"

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
  DialogClose,
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
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SuperCombobox } from "@/components/ui/super-combobox"
import { Textarea } from "@/components/ui/textarea"

import { getUser } from "@/lib/session.server"

import { db } from "@/db/index.server"
import { Company, companies, compinesToCategories } from "@/db/schema"

import { FILTERS } from "@/config/options"

import { categories } from "./schema"

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request)

  if (!user) {
    return redirect("/")
  }

  if (user.isAdmin === false) {
    return redirect("/")
  }

  const [allCompaniesCount] = await db
    .select({ count: count() })
    .from(companies)
  const allCompanies = await db.query.companies.findMany({
    with: {
      update: true,
    },
  })
  const [claimedCompanies] = await db
    .select({ count: count() })
    .from(companies)
    .where(eq(companies.claimed_status, "claimed"))
  const [unclaimedCompanies] = await db
    .select({ count: count() })
    .from(companies)
    .where(eq(companies.claimed_status, "unclaimed"))
  // console.log(claimRequests, "claimRequests"

  return {
    user,
    allCompanies,
    allCompaniesCount,
    claimedCompanies,
    unclaimedCompanies,
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData()
  const action = form.get("action")

  if (action === "add") {
    const name = form.get("name") as string
    const description = form.get("description") as string
    const website = form.get("website") as string
    const industries = form.get("industries") as string

    const [company] = await db
      .insert(companies)
      .values({
        metricsId: crypto.randomUUID(),
        name: name,
        logo: "",
        description: description,
        domain: website,
      })
      .returning()

    await db.insert(compinesToCategories).values({
      companyId: company.id,
      categoryId: industries,
    })
    return { done: "success" }
  }

  function createSlug(name: string) {
    return name
      .toLowerCase() // Convert the name to lowercase
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/[^\w-]+/g, "") // Remove non-word characters except hyphens
      .replace(/--+/g, "-") // Replace consecutive hyphens with a single hyphen
      .replace(/^-+|-+$/g, "") // Remove leading and trailing hyphens
  }

  if (action === "catAdd") {
    const name = form.get("name") as string
    const [cat] = await db
      .insert(categories)
      .values({
        name: name,
        slug: createSlug(name),
      })
      .returning()

    return { done: "success" }
  }
}

export default function Companies() {
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
            to="/admin"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            to="/admin/companies"
            className="text-foreground transition-colors hover:text-foreground"
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
          <Link
            to="/admin/grants"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Grants
          </Link>
          <Link
            to="/admin/partners"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Partners
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
        <div className="flex items-center gap-3">
          <Dialog>
            <DialogTrigger className="min-w-fit">
              <Button variant={"hero"}>Add company</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85%] w-[44rem] max-w-none overflow-y-scroll">
              <CardHeader>
                <CardTitle>Add Company</CardTitle>
              </CardHeader>
              <Form method="POST" className="flex flex-col gap-3">
                <div className="flex flex-col space-y-2">
                  <Label>Company Name</Label>
                  <Input placeholder="Company Name" name="name" />
                </div>
                <div className="flex flex-col space-y-2">
                  <Label>About Company</Label>
                  <Textarea placeholder="About Company" name="description" />
                </div>
                {/* <div className="flex flex-col space-y-2">
                            <Label>Linkedin Page</Label>
                            <Input placeholder="Linkedin Link" name="linkedin" />
                          </div> */}
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="picture">Company Logo</Label>
                  <Input id="picture" type="file" />
                </div>
                <div className="flex flex-col space-y-2">
                  <Label>Company Website</Label>
                  <Input placeholder="https://saaskart.co" name="website" />
                </div>
                {FILTERS ? (
                  <>
                    {FILTERS.map((filter) => {
                      if (filter.name === "industries") {
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
                            multiple={false}
                          />
                        )
                      }
                    })}
                  </>
                ) : null}
                <input type="hidden" name="action" value="add" />
                <DialogClose>
                  <Button type="submit" variant={"hero"} className="w-full">
                    Submit
                  </Button>
                </DialogClose>
              </Form>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger className="min-w-fit">
              <Button variant={"hero"}>Add category</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85%] w-[44rem] max-w-none overflow-y-scroll">
              <CardHeader>
                <CardTitle>Add category</CardTitle>
              </CardHeader>
              <Form method="POST" className="flex flex-col gap-3">
                <div className="flex flex-col space-y-2">
                  <Label>Category Name</Label>
                  <Input placeholder="Category Name" name="name" />
                </div>
                <input type="hidden" name="action" value="catAdd" />
                <DialogClose className="w-full">
                  <Button
                    className="w-full"
                    variant={"hero"}
                    onClick={() => {
                      toast("Category Added", {
                        description: "Category has been added",
                      })
                    }}
                  >
                    Add
                  </Button>
                </DialogClose>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold">Companies</h1>
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            <Card x-chunk="dashboard-01-chunk-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Companies
                </CardTitle>
                <BuildingIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loaderData.allCompaniesCount.count}
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
          </div>
        </div>
        <Card x-chunk="dashboard-04-chunk-1">
          <CardHeader>
            <CardTitle>All Companies</CardTitle>
          </CardHeader>
          <CardContent>
            {/* TODO: add into DB and also create a table or feild */}
            <div className="flex w-full">
              {loaderData?.allCompanies ? (
                <div className="flex w-full flex-col gap-3">
                  {loaderData?.allCompanies.map((company) => (
                    <div className="flex w-full items-center justify-between gap-2 rounded-lg border p-3">
                      <div className="flex items-center space-x-2">
                        <img
                          alt="Company logo"
                          className="rounded-full"
                          height={40}
                          src={company.logo as string}
                          style={{
                            aspectRatio: "40/40",
                            objectFit: "cover",
                          }}
                          width={40}
                        />
                        <Link to={`/companies/${company.id}`}>
                          <p className="font-semibold">{company.name}</p>
                        </Link>
                      </div>
                      <div className="flex justify-center gap-2">
                        {company.update && (
                          <Dialog>
                            <DialogTrigger>
                              <Button variant={"secondary"}>
                                Review Updates
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Company Info Update</DialogTitle>
                              </DialogHeader>
                              <div className="flex flex-col gap-2 py-3">
                                {company.update.name ? (
                                  <p className="font-semibold">
                                    Name:{" "}
                                    <span className="text-red-500">
                                      {company.name}
                                    </span>{" "}
                                    {"->"}{" "}
                                    <span className="text-green-500">
                                      {company.update.name}
                                    </span>
                                  </p>
                                ) : null}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button className="w-full">Accept</Button>
                                <Button
                                  className="w-full"
                                  variant={"destructive"}
                                >
                                  Decline
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                        <Link to={`/companies/edit/${company.id}`}>
                          <Button variant={"hero"}>Edit</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="w-full py-10 text-center text-lg font-semibold text-muted-foreground">
                  No companies found
                </p>
              )}
            </div>
          </CardContent>
          {/* <CardFooter className="border-t px-6 py-4">
                <p>
                  Not able to find your company on our platform?{" "}
                  <Dialog>
                    <DialogTrigger>
                      <span className="cursor-pointer text-blue-600 hover:underline">
                        Request to add it
                      </span>
                    </DialogTrigger>
                    <DialogContent className="max-h-[85%] w-[44rem] max-w-none overflow-y-scroll">
                      <CardHeader>
                        <CardTitle>Add Company Request</CardTitle>
                      </CardHeader>
                      <Form method="POST" className="flex flex-col gap-3">
                        <div className="flex flex-col space-y-2">
                          <Label>Company Name</Label>
                          <Input placeholder="Company Name" name="name" />
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Label>About Company</Label>
                          <Textarea
                            placeholder="About Company"
                            name="description"
                          />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                          <Label htmlFor="picture">Company Logo</Label>
                          <Input id="picture" type="file" />
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Label>Company Website</Label>
                          <Input
                            placeholder="https://saaskart.co"
                            name="website"
                          />
                        </div>
                        <input type="hidden" name="action" value="add" />
                        <Button type="submit" variant={"hero"}>
                          Submit
                        </Button>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </p>
              </CardFooter> */}
        </Card>
      </main>
    </div>
  )
}
