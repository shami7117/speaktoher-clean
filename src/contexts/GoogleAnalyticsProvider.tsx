"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import Script from "next/script"

// Extend the global Window interface
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

export const GoogleAnalyticsProvider = ({ gaId }: { gaId: string }) => {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window.gtag !== "function") return

    window.gtag("config", gaId, {
      page_path: pathname,
    })
  }, [pathname, gaId])

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy='afterInteractive'
      />
      <Script id='ga4-init' strategy='afterInteractive'>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  )
}
