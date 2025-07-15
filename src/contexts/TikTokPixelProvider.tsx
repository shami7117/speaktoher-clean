"use client"

import { createContext, useContext, useEffect } from "react"
import { usePathname } from "next/navigation"
import Script from "next/script"

interface TikTokContextType {
  trackEvent: (eventName: string, parameters?: Record<string, any>) => void
  trackPurchase: (value: number, currency?: string, contentId?: string) => void
  trackAddToCart: (value: number, currency?: string, contentId?: string) => void
  trackViewContent: (
    value: number,
    currency?: string,
    contentId?: string
  ) => void
  trackInitiateCheckout: (
    value: number,
    currency?: string,
    contentId?: string
  ) => void
}

const TikTokPixelContext = createContext<TikTokContextType | null>(null)

// Extend the global Window interface
declare global {
  interface Window {
    ttq?: {
      page: () => void
      track: (event: string, payload?: Record<string, any>) => void
      identify?: (...args: any[]) => void
      instances?: (...args: any[]) => void
      ready?: (...args: any[]) => void
    }
  }
}

export const TikTokPixelProvider = ({
  children,
  pixelId,
}: {
  children: React.ReactNode
  pixelId: string
}) => {
  const pathname = usePathname()

  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== "undefined" && window.ttq) {
      window.ttq.track(eventName, parameters)
    }
  }

  const trackPurchase = (
    value: number,
    currency: string = "USD",
    contentId?: string
  ) => {
    trackEvent("Purchase", {
      value: value,
      currency: currency,
      content_id: contentId,
      content_type: "product",
    })
  }

  const trackAddToCart = (
    value: number,
    currency: string = "USD",
    contentId?: string
  ) => {
    trackEvent("AddToCart", {
      value: value,
      currency: currency,
      content_id: contentId,
      content_type: "product",
    })
  }

  const trackViewContent = (
    value: number,
    currency: string = "USD",
    contentId?: string
  ) => {
    trackEvent("ViewContent", {
      value: value,
      currency: currency,
      content_id: contentId,
      content_type: "product",
    })
  }

  const trackInitiateCheckout = (
    value: number,
    currency: string = "USD",
    contentId?: string
  ) => {
    trackEvent("InitiateCheckout", {
      value: value,
      currency: currency,
      content_id: contentId,
      content_type: "product",
    })
  }

  useEffect(() => {
    if (typeof window !== "undefined" && window.ttq) {
      window.ttq.track("PageView", {
        page_url: pathname,
        page_title: document.title,
      })
    }
  }, [pathname])

  const contextValue: TikTokContextType = {
    trackEvent,
    trackPurchase,
    trackAddToCart,
    trackViewContent,
    trackInitiateCheckout,
  }

  return (
    <TikTokPixelContext.Provider value={contextValue}>
      {/* Inject TikTok Script once */}
      <Script id='tiktok-pixel' strategy='afterInteractive'>
        {`
          !function (w, d, t) {
              w.TiktokAnalyticsObject = t;
              var ttq = w[t] = w[t] || [];
              ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie"];
              ttq.setAndDefer = function (t, e) {
                  t[e] = function () {
                      t.push([e].concat(Array.prototype.slice.call(arguments, 0)))
                  }
              };
              for (var i = 0; i < ttq.methods.length; i++) {
                  ttq.setAndDefer(ttq, ttq.methods[i])
              }
              ttq.load = function (e, n) {
                  var i = "https://analytics.tiktok.com/i18n/pixel/events.js";
                  ttq._i = ttq._i || {};
                  ttq._i[e] = [];
                  ttq._i[e]._u = i;
                  ttq._t = ttq._t || {};
                  ttq._t[e] = +new Date;
                  ttq._o = ttq._o || {};
                  ttq._o[e] = n || {};
                  var a = document.createElement("script");
                  a.type = "text/javascript";
                  a.async = true;
                  a.src = i + "?sdkid=" + e + "&lib=" + t;
                  var s = document.getElementsByTagName("script")[0];
                  s.parentNode.insertBefore(a, s);
              };
              ttq.load('${pixelId}');
              ttq.page();
          }(window, document, 'ttq');
        `}
      </Script>
      {children}
    </TikTokPixelContext.Provider>
  )
}

// Hook to use TikTok pixel
export const useTikTok = () => {
  const context = useContext(TikTokPixelContext)
  if (!context) {
    throw new Error("useTikTok must be used within a TikTokPixelProvider")
  }
  return context
}
