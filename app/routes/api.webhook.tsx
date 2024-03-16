import { eq } from "drizzle-orm"

import { db } from "@/db/index.server"
import { users } from "@/db/schema"

export const action = async ({ request }: any) => {
  // Handle subscription events
  if (request.method === "POST") {
    const body = await request.json()
    const { data, meta } = body

    console.log(JSON.stringify(meta), "meta")

    if (meta.event_name === "order_created") {
      await db
        .insert(users)
        .values({
          email: `${data.attributes.user_email}`,
          isLifetime: true,
        })
        .onConflictDoUpdate({ target: users.email, set: { isLifetime: true } })

      return new Response("success", { status: 200 })
    }

    if (meta.event_name === "subscription_created") {
      await db
        .insert(users)
        .values({
          email: `${data.attributes.user_email}`,
          subscriptionId: `${data.id}`,
          customerId: `${data.attributes.customer_id}`,
          variantId: data.attributes.variant_id,
          currentPeriodEnd: data.attributes.renews_at,
          isLifetime: false,
        })
        .onConflictDoUpdate({
          target: users.email,
          set: {
            email: `${data.attributes.user_email}`,
            subscriptionId: `${data.id}`,
            customerId: `${data.attributes.customer_id}`,
            variantId: data.attributes.variant_id,
            currentPeriodEnd: data.attributes.renews_at,
            isLifetime: false,
          },
        })

      return new Response("success", { status: 200 })
    }

    if (meta.event_name === "subscription_updated") {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.subscriptionId, data.id))

      if (!user || !user.subscriptionId) return

      await db
        .update(users)
        .set({
          variantId: data.attributes.variant_id,
          currentPeriodEnd: data.attributes.renews_at,
        })
        .where(eq(users.subscriptionId, user.subscriptionId))

      return new Response("updated", { status: 200 })
    }

    if (meta.event_name === "subscription_cancelled") {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.subscriptionId, data.id))

      if (!user || !user.subscriptionId) return

      await db
        .update(users)
        .set({ cancelled: true })
        .where(eq(users.subscriptionId, user.subscriptionId))

      return new Response("cancelled", { status: 200 })
    }

    if (meta.event_name === "subscription_expired") {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.subscriptionId, data.id))

      if (!user || !user.subscriptionId) return

      await db
        .update(users)
        .set({ expired: true })
        .where(eq(users.subscriptionId, user.subscriptionId))

      return new Response("expired", { status: 200 })
    }
  }

  // Return a 404 for other requests
  return new Response("Not found", { status: 404 })
}

// DO NOT REMOVE THIS

// const response = await fetch(
//   "https://api.lemonsqueezy.com/v1/checkouts",
//   {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
//     },
//     body: JSON.stringify(checkoutData),
//   },
// )
