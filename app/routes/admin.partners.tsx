import { PopoverClose } from "@radix-ui/react-popover"
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node"
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react"
import { count, eq } from "drizzle-orm"
import {
  Activity,
  ArrowUpRight,
  BuildingIcon,
  CreditCard,
  DollarSign,
  FileQuestion,
  Loader2,
  Menu,
  Package2,
  Plus,
  Search,
  Settings,
  User,
  UserCircle2,
  Users,
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

// import { toast } from "sonner"
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
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

import { cities } from "@/lib/const"
import { getUser } from "@/lib/session.server"

import { db, schema } from "@/db/index.server"
import {
  Claim,
  Partner,
  claims,
  companies,
  grants,
  partners,
} from "@/db/schema"

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request)

  if (!user) {
    return redirect("/")
  }

  if (user.isAdmin === false) {
    return redirect("/")
  }

  const partners = await db.query.partners.findMany()

  return {
    partners,
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData()
  const action = form.get("action")

  if (action === "addPartner") {
    const title = form.get("title") as string
    const link = form.get("link") as string
    const icon = form.get("icon") as string
    const city = form.get("city") as string
    const description = form.get("description") as string

    const partner = await db
      .insert(partners)
      .values({
        title: title,
        description: description,
        city: city,
        from: "",
        icon: icon,
        link: link,
      })
      .returning()
    if (partner) {
      return { data: "success" }
    }
  }

  if (action === "editPartner") {
    const title = form.get("title") as string
    const id = form.get("id") as string
    const link = form.get("link") as string
    const icon = form.get("icon") as string
    const from = form.get("from") as string
    const description = form.get("description") as string

    const partner = await db
      .update(partners)
      .set({
        title: title,
        description: description,
        from: from,
        icon: icon,
        link: link,
      })
      .where(eq(partners.id, id))
      .returning()
    if (partner) {
      return { data: "updateSuccess" }
    }
  }

  if (action === "delete") {
    const id = form.get("id") as string

    const partner = await db
      .delete(partners)
      .where(eq(partners.id, id))
      .returning()
    if (partner) {
      return { data: "updateSuccess" }
    }
  }
}

export default function Partners() {
  const loaderData = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const [isLoading, setLoader] = useState(false)

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
          <Link
            to="/admin/grants"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Grants
          </Link>
          <Link
            to="/admin/partners"
            className="text-foreground transition-colors hover:text-foreground"
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
              <Link to="/admin" className="hover:text-foreground">
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
        <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Partners</CardTitle>
              <CardDescription>All Partners.</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger className="ml-auto">
                <Button asChild size="sm" className="ml-auto gap-1">
                  <div className="cursor-pointer">
                    Add New
                    <Plus className="h-4 w-4" />
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add new partner</DialogTitle>
                </DialogHeader>
                <Form method="post" className="flex flex-col space-y-3">
                  <div className="flex flex-col space-y-2">
                    <Label>Title</Label>
                    <Input placeholder="Title" name="title" />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Label>Link</Label>
                    <Input placeholder="Link" name="link" />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Label>Icon</Label>
                    <Input placeholder="IconLink" name="icon" />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Label>City</Label>
                    <Select name="city">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select City" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup className="max-h-40 ">
                          {cities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Label>Category</Label>
                    <Input placeholder="Category" name="category" />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Label>Description</Label>
                    <Textarea placeholder="Description" name="description" />
                  </div>
                  <input type="hidden" name="action" value="addPartner" />
                  <Button
                    onClick={() => {
                      toast("Partner Added", {
                        description: "Partner has been added",
                      })
                    }}
                    variant={"hero"}
                    className="flex items-center gap-2"
                  >
                    Add{" "}
                    {isLoading ? (
                      <Loader2 className="animate-spin" size={15} />
                    ) : null}
                  </Button>
                </Form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loaderData.partners.map((partner: any) => (
                  <ClaimCard partner={partner} isLoading={isLoading} />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

const ClaimCard = ({
  partner,
  isLoading,
}: {
  partner: Partner
  isLoading: boolean
}) => {
  return (
    <Dialog>
      <TableRow>
        <TableCell>
          <div className="font-medium">{partner.title}</div>
        </TableCell>
        <TableCell>
          <div className="font-medium">{partner.from}</div>
        </TableCell>
        <TableCell>
          <div className="font-medium">{partner.link}</div>
        </TableCell>
        <TableCell className="text-right">
          <div className="item flex justify-end gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Delete</Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="flex flex-col gap-3">
                  <p>Delete this partner?</p>
                  <div className="flex items-center gap-3">
                    <Form method="post">
                      <input type="hidden" name="id" value={partner.id} />
                      <input type="hidden" name="action" value="delete" />
                      <Button variant={"destructive"}>Yes</Button>
                    </Form>
                    <PopoverClose>
                      <Button variant={"outline"}>No</Button>
                    </PopoverClose>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <DialogTrigger>
              <Button variant="outline">Edit</Button>
            </DialogTrigger>
          </div>
        </TableCell>
      </TableRow>
      <DialogContent>
        <Form method="post" className="flex flex-col space-y-3">
          <div className="flex flex-col space-y-2">
            <Label>Title</Label>
            <Input
              placeholder="Title"
              name="title"
              defaultValue={partner.title}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <Label>Link</Label>
            <Input
              placeholder="Link"
              name="link"
              defaultValue={partner.link as string}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <Label>Icon</Label>
            <Input
              placeholder="IconLink"
              name="icon"
              defaultValue={partner.icon as string}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <Label>From</Label>
            <Input placeholder="From" name="from" defaultValue={partner.from} />
          </div>
          <div className="flex flex-col space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Description"
              name="description"
              defaultValue={partner.description}
            />
          </div>
          <input type="hidden" name="action" value="editPartner" />
          <input type="hidden" name="id" value={partner.id} />
          <Button
            type="submit"
            variant={"hero"}
            className="flex items-center gap-2"
            onClick={() => {
              toast("Partner Updated Added", {
                description: "Partner has been updated",
              })
            }}
          >
            Edit{" "}
            {isLoading ? <Loader2 className="animate-spin" size={15} /> : null}
          </Button>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
