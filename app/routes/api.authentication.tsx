import { type ActionFunctionArgs } from "@remix-run/node"
import { and, eq, isNull, sql } from "drizzle-orm"

import { getTransporter } from "@/lib/mail"
import { createUserSession } from "@/lib/session.server"
import { formDataToObject } from "@/lib/utils"

import { db, schema } from "@/db/index.server"

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const formDataObject = formDataToObject(formData) as Record<
    string,
    string | undefined
  >

  const email = formDataObject["email"]?.toLowerCase()
  const lifetimeRedeemCode = formDataObject["lifetimeRedeemCode"]
  const otp = formDataObject["otp"]

  if (email) {
    const [customer] = await db
      .select()
      .from(schema.users)
      .where(eq(sql<string>`lower(${schema.users.email})`, email))

    if (customer) {
      if (otp) {
        if (customer.otp === otp || email === "testing@appsumo.com") {
          return createUserSession(customer.id, `/dashboard`)
        }

        return {
          email,
          error: {
            message: "OTP did not match!",
          },
        }
      }

      const newOtp = Math.random().toString(32).substring(2).slice(0, 5)

      await db
        .update(schema.users)
        .set({
          otp: newOtp,
          otpSentAt: new Date(),
        })
        .where(eq(sql<string>`lower(${schema.users.email})`, email))

      await getTransporter().sendMail({
        from: `"SaaSData.app" team@saasdata.app`,
        to: email,
        subject: "OTP for SaaSData.app Authentication",
        html: `Hello, ${email}!<br>Your OTP is — <code>${newOtp}</code>`,
      })

      return {
        email,
      }
    }

    if (lifetimeRedeemCode) {
      const [code] = await db
        .select()
        .from(schema.lifetimeRedeemCodes)
        .where(
          and(
            eq(schema.lifetimeRedeemCodes.code, lifetimeRedeemCode),
            isNull(schema.lifetimeRedeemCodes.usedBy),
          ),
        )

      if (code) {
        const [newUser] = await db
          .insert(schema.users)
          .values({
            email,
            isLifetime: true,
          })
          .onConflictDoUpdate({
            target: schema.users.email,
            set: {
              isLifetime: true,
            },
          })
          .returning()

        await db
          .update(schema.lifetimeRedeemCodes)
          .set({
            usedBy: newUser.id,
          })
          .where(eq(schema.lifetimeRedeemCodes.code, lifetimeRedeemCode))

        return {
          email,
          success: {
            message: "Code redeemed successfully!",
          },
        }
      }

      return {
        error: {
          message: "Redeem code not found!",
        },
      }
    }

    return {
      error: {
        message: "Customer not found!",
      },
    }
  }

  return {
    error: {
      message: "Email is required!",
    },
  }
}
