import { type MetaFunction } from "@remix-run/node"
import { Link } from "@remix-run/react"
import { ArrowLeft } from "lucide-react"
import { type ReactNode } from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"

import { getMetaTags } from "@/config/meta"

export const meta: MetaFunction = () => {
  return [
    ...getMetaTags({
      title: ["Legal"],
      description:
        "Contact information, privacy policy & terms of service for SaaSData.app",
    }),
  ]
}

export default function Legal() {
  return (
    <div className="relative flex min-h-screen flex-col items-stretch gap-8 overflow-y-auto overflow-x-hidden py-4 sm:py-8">
      <div className="container flex flex-row flex-wrap items-center justify-start gap-4 px-4">
        <Button asChild>
          <Link to="/">
            <ArrowLeft size={16} className="opacity-50" />
            <span>Back home</span>
          </Link>
        </Button>
        <Link to="/" className="flex flex-row items-center justify-start gap-2">
          <img src="/logo.svg" alt="logo" width={20} height={20} />
          <span className="text-xl/none font-bold">SaaSData</span>
          <p className="text-xl/none font-medium opacity-75">Legal</p>
        </Link>
      </div>
      <div className="container flex flex-col items-stretch justify-start gap-4 px-4">
        <Accordion
          type="multiple"
          defaultValue={sections.map((section) => section.id)}
        >
          {sections.map((section) => (
            <AccordionItem key={section.id} id={section.id} value={section.id}>
              <AccordionTrigger className="text-2xl font-extrabold">
                {section.title}
              </AccordionTrigger>
              <AccordionContent className="prose">
                {section.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}

const sections: Array<{
  id: string
  title: string
  content: ReactNode
}> = [
  {
    id: "contact",
    title: "Contact",
    content: (
      <>
        <p>For any inquiries or assistance, please contact us at:</p>

        <p>
          SaaSData
          {/* <br />
          [Your Company Address]
          <br />
          [City, State, ZIP Code] */}
          <br />
          Email: <a href="mailto:info@invocationx.in">info@invocationx.in</a>
          {/* <br /> */}
          {/* Phone: [Your Contact Number] */}
        </p>
      </>
    ),
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    content: (
      <>
        <p>
          <em>Effective Date: 14/12/2023</em>
        </p>

        <p>
          At SaaSData, we are committed to protecting the privacy of our users.
          This Privacy Policy outlines how we collect, use, and safeguard your
          information when you use our website.
        </p>

        <h3>Information We Collect:</h3>
        <p>
          We collect information provided by users during account registration,
          payment processes, and when using our platform.
        </p>

        <h3>How We Use Your Information:</h3>
        <p>
          We use your information to provide and improve our services, process
          payments, and enhance user experience. We do not sell or share your
          personal information with third parties.
        </p>

        <h3>Security:</h3>
        <p>
          We implement security measures to protect your information. However,
          no method of transmission over the internet or electronic storage is
          completely secure. Therefore, we cannot guarantee absolute security.
        </p>

        <p>
          <strong>Lifetime Subscription:</strong>
          <br />
          Our "Lifetime" subscription means access for at least one year after
          purchase and until the product is no longer operational. In that case
          the all the data will be given to the customers in csv format.
        </p>

        <h3>Terms of Service:</h3>
        <p>By using SaaSData, you agree to our Terms of Service.</p>

        <h3>Changes to Privacy Policy:</h3>
        <p>
          We may update our Privacy Policy. We will notify users of any changes
          by posting the new policy on this page.
        </p>
      </>
    ),
  },
  {
    id: "terms",
    title: "Terms & Conditions",
    content: (
      <>
        <p>
          <em>Effective Date: 14/12/2023</em>
        </p>

        <p>
          By accessing and using SaaSData, you agree to be bound by these Terms
          of Service.
        </p>

        <p>
          <strong>Lifetime Subscription:</strong>
          <br />
          The "Lifetime" subscription provides access for at least one year
          after purchase and until the product is no longer operational. In that
          case the all the data will be given to the customers in csv format.
        </p>

        <h3>Payment:</h3>
        <p>
          Payments are processed securely. Monthly subscriptions can be canceled
          anytime. Lifetime subscriptions are one-time payments with access for
          the specified period.
        </p>

        <h3>Prohibited Uses:</h3>
        <p>
          Users may not misuse the platform for illegal or unauthorized
          purposes. We reserve the right to suspend or terminate accounts
          engaging in such activities.
        </p>

        <h3>Disclaimer:</h3>
        <p>
          SaaSData is provided "as is" without any warranty. We are not
          responsible for any inaccuracies or errors in the data.
        </p>

        <h3>Changes to Terms:</h3>
        <p>
          We may revise these Terms of Service. By continuing to use the
          platform after changes, you agree to the revised terms.
        </p>
      </>
    ),
  },
]
