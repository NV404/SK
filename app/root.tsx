import { cssBundleHref } from "@remix-run/css-bundle"
import {
  type LinksFunction,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
} from "@remix-run/react"
import { useEffect, useState } from "react"
import TopBarProgress from "react-topbar-progress-indicator"
import tailwindCssHref from "~/styles/tailwind.css"

import { Toaster } from "@/components/ui/toaster"

import * as gtag from "@/lib/gtags.client"
import { getUser } from "@/lib/session.server"

import { getMetaTags } from "@/config/meta"

export async function loader({ request }: LoaderFunctionArgs) {
  return {
    user: await getUser(request, false),
    GA_TRACKING_ID: process.env.GA_TRACKING_ID,
  }
}

export const meta: MetaFunction = () => {
  return [...getMetaTags()]
}

export const links: LinksFunction = () => [
  {
    rel: "icon",
    href: "/favicon.ico?v=1",
    sizes: "48x48",
  },
  {
    rel: "icon",
    type: "image/svg+xml",
    href: "/logo.svg?v=1",
    sizes: "any",
  },
  {
    rel: "apple-touch-icon",
    href: "/apple-touch-icon.png?v=1",
    sizes: "180x180",
  },

  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  {
    rel: "stylesheet",
    href: tailwindCssHref,
  },
]

export default function Root() {
  const location = useLocation()
  const { GA_TRACKING_ID } = useLoaderData<typeof loader>()
  const [progress, setProgress] = useState(false)
  const [prevLoc, setPrevLoc] = useState("")

  useEffect(() => {
    setProgress(true)
    setPrevLoc(location.pathname)
    if (location.pathname === prevLoc) {
      setPrevLoc("")
    }
  }, [location])

  useEffect(() => {
    setProgress(false)
  }, [prevLoc])

  useEffect(() => {
    if (GA_TRACKING_ID?.length) {
      gtag.pageview(location.pathname, GA_TRACKING_ID)
    }
  }, [location, GA_TRACKING_ID])

  return (
    <html lang="en" className="scroll-smooth" prefix="og: http://ogp.me/ns#">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1 " />
        <Meta />
        <meta name="theme-color" content="#000000" />

        <Links />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100;0,9..40,200;0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900;0,9..40,1000;1,9..40,100;1,9..40,200;1,9..40,300;1,9..40,400;1,9..40,500;1,9..40,600;1,9..40,700;1,9..40,800;1,9..40,900;1,9..40,1000&display=swap"
          rel="stylesheet"
        />
        <script src="https://assets.lemonsqueezy.com/lemon.js" defer></script>
      </head>
      <body className="accent-black">
        {process.env.NODE_ENV === "development" || !GA_TRACKING_ID ? null : (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
            />
            <script
              async
              id="gtag-init"
              dangerouslySetInnerHTML={{
                __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', '${GA_TRACKING_ID}', {
                  page_path: window.location.pathname,
                });
              `,
              }}
            />
          </>
        )}

        {progress && <TopBarProgress />}

        <Outlet />
        <Toaster />

        <ScrollRestoration />
        <Scripts />

        <LiveReload />
      </body>
    </html>
  )
}
