export type ServerRuntimeMetaDescriptor =
  | {
      charSet: "utf-8"
    }
  | {
      title: string
    }
  | {
      name: string
      content: string
    }
  | {
      property: string
      content: string
    }
  | {
      httpEquiv: string
      content: string
    }
  | {
      "script:ld+json": LdJsonObject
    }
  | {
      tagName: "meta" | "link"
      [name: string]: string
    }
  | {
      [name: string]: unknown
    }
type LdJsonObject = {
  [Key in string]: LdJsonValue
} & {
  [Key in string]?: LdJsonValue | undefined
}
type LdJsonArray = LdJsonValue[] | readonly LdJsonValue[]
type LdJsonPrimitive = string | number | boolean | null
type LdJsonValue = LdJsonPrimitive | LdJsonObject | LdJsonArray

export function getMetaTags(
  options?: {
    title?: string | string[]
    description?: string
  },
  more?: ServerRuntimeMetaDescriptor[],
) {
  let title = "SaasKart.app — Database of SaaS companies & founders"
  let description =
    "Discover, analyze, and stay ahead in the competitive startup landscape with our extensive database of software as a service companies and their founders."

  if (options?.title) {
    if (Array.isArray(options.title)) {
      title = [...options.title, "SaasKart.co"].join(" — ")
    } else {
      title = options.title
    }
  }

  if (options?.description) {
    description = options.description
  }

  return [
    { title },
    {
      name: "description",
      content: description,
    },

    // og
    {
      property: "og:title",
      content: title,
    },
    {
      property: "og:description",
      content: description,
    },
    {
      property: "og:type",
      content: "website",
    },
    {
      property: "og:url",
      content: "https://saasdata.app",
    },
    {
      property: "og:image",
      content: "https://saasdata.app/og.png",
    },
    {
      property: "og:image:secure_url",
      content: "https://saasdata.app/og.png",
    },
    {
      property: "og:image:type",
      content: "image/png",
    },
    {
      property: "og:image:width",
      content: "1200",
    },
    {
      property: "og:image:height",
      content: "630",
    },
    {
      property: "twitter:card",
      content: "summary_large_image",
    },
    {
      property: "twitter:image",
      content: "https://saasdata.app/og.png",
    },
    {
      property: "twitter:image:alt",
      content: "SaaSData.app og header",
    },

    ...(more ?? []),
  ]
}
