import { LoaderFunctionArgs, redirect } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { getUser } from "@/lib/session.server"

import { db } from "@/db/index.server"

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await getUser(request, false)

  if (!user) {
    return redirect("/")
  }

  let companies = await db.query.companies.findMany({
    where: (company, { eq }) => eq(company.managerId, user.id),
  })

  return { companies }
}

export default function ProfileCompany() {
  const loaderData = useLoaderData<typeof loader>()

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
            <Link to="/dashboard/profile">General</Link>
            <Link
              to="/dashboard/profile/company"
              className="font-semibold text-primary"
            >
              My Companies
            </Link>
            <Link to="#">My Reviews</Link>
            {/* <Link to="#">Support</Link>
            <Link to="#">Organizations</Link>
            <Link to="#">Advanced</Link> */}
          </nav>
          <div className="grid gap-6">
            <Card x-chunk="dashboard-04-chunk-1">
              <CardHeader>
                <CardTitle>Companies</CardTitle>
                <CardDescription>
                  All companies which are managed by you
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* TODO: add into DB and also create a table or feild */}
                <div className="flex w-full">
                  {loaderData?.companies && loaderData?.companies.length > 0 ? (
                    <div className="flex w-full flex-col gap-3">
                      {loaderData?.companies.map((company) => (
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
                            <p className="font-semibold">{company.name}</p>
                          </div>
                          <Button variant={"hero"}>Edit</Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="w-full py-10 text-center text-lg font-semibold text-muted-foreground">
                      You don't manage any companies right now
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
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
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col space-y-2">
                          <Label>Company Name</Label>
                          <Input placeholder="Company Name" />
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Label>About Company</Label>
                          <Textarea placeholder="About Company" />
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Label>Linkedin Page</Label>
                          <Input placeholder="Linkedin Link" />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                          <Label htmlFor="picture">Company Logo</Label>
                          <Input id="picture" type="file" />
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Label>Company Website</Label>
                          <Input placeholder="https://saaskart.co" />
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Label>Categories</Label>
                          <Input placeholder="Start Typing..." />
                        </div>
                        <Button variant={"hero"}>Submit</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
