import { Authenticator, AuthorizationError } from "remix-auth"
import { FormStrategy } from "remix-auth-form"

import { User } from "@/db/schema"

import { login, signup, storage } from "./session.server"

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
const authenticator = new Authenticator<User | Error | null>(storage, {
  sessionKey: "sessionKey",
  sessionErrorKey: "sessionErrorKey",
})

authenticator.use(
  new FormStrategy(async ({ form }) => {
    let email = form.get("email") as string
    let password = form.get("password") as string
    let action = form.get("action")
    if (action === "login") {
      let { error, user } = await login(email, password)
      if (error) {
        throw new AuthorizationError(error)
      }
      return user
    }
    if (action === "signup") {
      let { user, error } = await signup(email, password)
      if (error) {
        throw new AuthorizationError(error)
      }
      return user
    }
    return null
  }),
  // each strategy has a name and can be changed to use another one
  // same strategy multiple times, especially useful for the OAuth2 strategy.
  "user-pass",
)

export default authenticator
