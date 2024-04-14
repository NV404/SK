import { Link } from "@remix-run/react"
import { Menu, Package2, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function Profile() {
  return (
    <div className="flex h-full w-full flex-col">
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
        <div className="mx-auto grid w-full max-w-6xl gap-2">
          <h1 className="text-3xl font-semibold">Settings</h1>
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
          <nav
            className="grid gap-4 text-sm text-muted-foreground"
            x-chunk="dashboard-04-chunk-0"
          >
            <Link to="#" className="font-semibold text-primary">
              General
            </Link>
            <Link to="/dashboard/profile/company">My Companies</Link>
            <Link to="#">My Reviews</Link>
            {/* <Link to="#">Support</Link>
            <Link to="#">Organizations</Link>
            <Link to="#">Advanced</Link> */}
          </nav>
          <div className="grid gap-6">
            <Card x-chunk="dashboard-04-chunk-1">
              <CardHeader>
                <CardTitle>Basic details</CardTitle>
                <CardDescription>Basic profile detils</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="flex flex-col gap-3">
                  <div className="flex flex-col space-y-2">
                    <Label>Name</Label>
                    <Input placeholder="Name" />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Label>Phone Number</Label>
                    <Input placeholder="Phone number" />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Label>Email</Label>
                    <Input placeholder="Email" />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Label>Linkedin Profile</Label>
                    <Input placeholder="Linkedin Profile" />
                  </div>
                  <div className="flex w-full items-center gap-3">
                    <div className="flex w-full flex-col gap-2">
                      <Label>Company Name</Label>
                      <Input
                        name="companyname"
                        type="text"
                        className="w-full"
                      ></Input>
                    </div>
                    <div className="flex w-full flex-col gap-2">
                      <Label>Company Size</Label>
                      <Select name="companysize">
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="myself">myself</SelectItem>
                            <SelectItem value="2">2-10</SelectItem>
                            <SelectItem value="11">11-50</SelectItem>
                            <SelectItem value="51">51-200</SelectItem>
                            <SelectItem value="201">201-500</SelectItem>
                            <SelectItem value="501">501-1000</SelectItem>
                            <SelectItem value="1000">1000+</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button>Save</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
