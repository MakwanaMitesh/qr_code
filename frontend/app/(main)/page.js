import Hero from '@/components/Hero'
import ToolsStrip from '@/components/ToolsStrip'
import PopularTools from '@/components/PopularTools'
import HowItWorks from '@/components/HowItWorks'
import LiveGenerator from '@/components/LiveGenerator'
import WhyChooseUs from '@/components/WhyChooseUs'
import FAQ from '@/components/FAQ'

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { q: 'What is a QR code?', a: 'A QR (Quick Response) code is a 2D barcode that can be scanned by smartphones to quickly access URLs, text, contact information, and more without typing anything.' },
    { q: 'How do I generate a QR code?', a: 'Choose the code type, enter your content, customize colors and size if needed, then click Download PNG to save your high-resolution QR code.' },
    { q: 'Are the generated codes free?', a: 'Yes! QRCraft is 100% free. You can generate unlimited codes without any subscription, login, or payment required.' },
    { q: 'Can I download the generated codes?', a: 'Absolutely! You can download your generated codes as high-resolution PNG or SVG files, ready for print and digital use.' },
    { q: 'Can I generate barcodes?', a: 'Yes, QRCraft supports barcode generation in addition to QR codes. Select "Barcode" from the tool sidebar to get started.' },
    { q: 'Do I need to create an account?', a: 'No account required. QRCraft is designed to be instant and friction-free - just open the page and start generating.' },
  ].map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

const appJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'QRCraft',
  url: 'https://qrcode.kalpvarti.com',
  applicationCategory: 'UtilityApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'Free online QR code and barcode generator with custom colors, logos, and scan tracking.',
}

export default function HomePage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Hero />
      <ToolsStrip />
      <PopularTools />
      <HowItWorks />
      <LiveGenerator />
      <WhyChooseUs />
      <FAQ />
    </main>
  )
}
