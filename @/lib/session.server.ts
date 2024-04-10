import { createCookieSessionStorage, redirect } from "@remix-run/node"
import bcrypt from "bcryptjs"
import { and, eq } from "drizzle-orm"

import { db } from "@/db/index.server"
import { users } from "@/db/schema"

const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set")
}

export const storage = createCookieSessionStorage({
  cookie: {
    name: "RJ_session",
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
})

function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"))
}

export async function getUserId(request: Request) {
  const session = await getUserSession(request)
  const userId = session.get("userId")
  if (!userId || typeof userId !== "string") {
    return null
  }
  return userId
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const session = await getUserSession(request)
  const userId = session.get("userId")
  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]])
    throw redirect(`/?login=true&${searchParams}`)
  }
  return userId
}

export async function getUser(request: Request, autoLogout: boolean = true) {
  const userId = await getUserId(request)
  if (typeof userId !== "string") {
    return null
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId))

  if (autoLogout && !user) {
    throw await logout(request)
  }

  return user
}

export async function login(email: string, password: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email))

  if (!user) {
    return { error: "user not found!", user }
  }

  const isCorrectPassword = await bcrypt.compare(password, user.passwordHash)
  if (!isCorrectPassword) {
    return { error: "password is incorrect!!", user }
  }

  return { user }
}

export async function signup(email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 10)
  if (password.length < 6) {
    return { error: "password is too short!!", user: null }
  }
  const [userCheck] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
  if (userCheck) {
    console.log(userCheck, "userCheck")
    return { error: "user with this email already exists!!", user: null }
  }
  const [user] = await db
    .insert(users)
    .values({
      email: email,
      passwordHash: passwordHash,
    })
    .returning()

  return { user }
}

export async function logout(request: Request) {
  const session = await getUserSession(request)
  return redirect("/", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  })
}

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await storage.getSession()
  session.set("userId", userId)
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  })
}
