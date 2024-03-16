import { useCallback, useState } from "react"

// import { type FetchOptions, ofetch } from "ofetch"

export function useOFetcher<T = any>() {
  const [loading, setLoading] = useState<boolean>(false)
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<any>(null)

  const load = useCallback(async (href: string, options?: RequestInit) => {
    setLoading(true)
    setData(null)
    setError(null)

    console.log(`fetching: ${href}`)

    fetch(href, options)
      .then(async (response) => {
        setData(await response.json())
      })
      .catch((error) => {
        setError(error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return {
    loading,
    data,
    error,

    load,
  }
}
