import { type ActionFunctionArgs } from "@remix-run/node"

import { createUserSession, login, signup } from "@/lib/session.server"

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData()
  const email = form.get("email") as string
  const password = form.get("password") as string
  const action = form.get("action")

  if (action === "login") {
    let { error, user } = await login(email, password)
    if (error) {
      return { error }
    }
    return createUserSession(user?.id, "/profile")
  }
  if (action === "signup") {
    let { user, error } = (await signup(email, password)) as any
    if (error) {
      return { error }
    }
    return createUserSession(user?.id, "/profile")
  }
  return null
}
