import { createTransport } from "nodemailer"

const BREVO_SMTP_KEY = process.env.BREVO_SMTP_KEY

if (!BREVO_SMTP_KEY) {
  throw Error("BREVO_SMTP_KEY is required!")
}

export function getTransporter() {
  return createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    // secure: true,
    auth: {
      user: "vaibhavacharya111@gmail.com",
      pass: BREVO_SMTP_KEY,
    },
  })
}
