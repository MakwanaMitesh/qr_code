import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'], weight: ['300','400','500','600','700','800','900'] })

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID

const SITE_URL = 'https://qrcode.kalpvarti.com'
const SITE_NAME = 'QRCraft'
const TITLE = 'QRCraft - Free QR Code Generator | Barcode, Wi-Fi, URL & More'
const DESCRIPTION = 'Generate free QR codes, barcodes, Wi-Fi codes, URL codes, vCard and email QR codes instantly. Customize colors, add a logo, download PNG/SVG, and track scans — no sign-up required.'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s | QRCraft',
  },
  description: DESCRIPTION,
  keywords: [
    'QR code generator', 'free QR code generator', 'barcode generator',
    'Wi-Fi QR code', 'vCard QR code', 'dynamic QR code', 'trackable QR code',
    'URL QR code generator online', 'QR code with logo',
  ],
  authors: [{ name: 'QRCraft' }],
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-bs-theme="light" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
      </head>
      <body className={inter.className}>
        {children}
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-YvpcrYf0tY3lHB60NNkmXc4s9bIOgUxi8T/jzmYVnB52vDR6cEDJFjUe9DKqNcK2"
          crossOrigin="anonymous"
          async
        />
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
        {CLARITY_ID && (
          <Script id="ms-clarity" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${CLARITY_ID}");
            `}
          </Script>
        )}
      </body>
    </html>
  )
}
