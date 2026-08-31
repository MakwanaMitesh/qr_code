import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], weight: ['300','400','500','600','700','800','900'] })

export const metadata = {
  title: 'QRCraft - Free QR Code Generator | Barcode, Wi-Fi, URL & More',
  description: 'Generate QR codes, barcodes, Wi-Fi codes, URL codes, vCard codes and more instantly. Free, fast, no sign-up required.',
  openGraph: {
    title: 'QRCraft - Free QR Code Generator',
    description: 'Generate QR codes, barcodes and more instantly for free.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-bs-theme="dark" suppressHydrationWarning>
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
      </body>
    </html>
  )
}
