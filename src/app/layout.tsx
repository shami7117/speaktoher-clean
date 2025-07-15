import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import "./globals.css"
import Footer from "@/components/layout/Footer"
import { getPublishableKey } from "@/lib/stripe/stripeConfig"
import { StripeProvider } from "@/lib/stripe/StripeContext"
import PreventNavigation from "@/components/ui/PreventNavigation"
import { TikTokPixelProvider } from "@/contexts/TikTokPixelProvider"
import { cookies } from "next/headers"
import { GoogleAnalytics } from "@next/third-parties/google"
import Script from "next/script"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700"],
})

export const metadata: Metadata = {
  title: "SPEAK TO HER",
  description: "Divine messages and spiritual guidance",
}

const RootLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  const cookieStore = await cookies()
  const isMember = cookieStore.get("is_member")?.value === "true"
  const customerId = cookieStore.get("customer_id")?.value || ""

  return (
    <html lang='en'>
      <head>
        <meta
          content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
          name='viewport'
        />
      </head>
      <body className={montserrat.className}>
        <TikTokPixelProvider pixelId='D1JQ6VJC77UC7RSGO530'>
          <StripeProvider publishableKey={getPublishableKey()}>
            {/* <PreventNavigation
                enabled={true}
                message='Are you sure you want to leave? Your divine connection may be interrupted.'
              /> */}
            {children}
            <Footer isMember={isMember} customerId={customerId} />
          </StripeProvider>
        </TikTokPixelProvider>
        <Script id='hotjar'>
          {`
(function(h,o,t,j,a,r){
    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    h._hjSettings={hjid:6442023,hjsv:6};
    a=o.getElementsByTagName('head')[0];
    r=o.createElement('script');r.async=1;
    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
    a.appendChild(r);
})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`}
        </Script>
      </body>

      <GoogleAnalytics gaId='G-X44X8W5FZK' />
    </html>
  )
}

export default RootLayout
