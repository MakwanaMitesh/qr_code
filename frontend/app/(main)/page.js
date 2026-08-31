import Hero from '@/components/Hero'
import ToolsStrip from '@/components/ToolsStrip'
import AdBanner from '@/components/AdBanner'
import PopularTools from '@/components/PopularTools'
import HowItWorks from '@/components/HowItWorks'
import LiveGenerator from '@/components/LiveGenerator'
import WhyChooseUs from '@/components/WhyChooseUs'
import FAQ from '@/components/FAQ'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <ToolsStrip />
      <section className="py-4">
        <div className="container">
          <AdBanner label="Advertisement · Google AdSense Banner (728 x 90)" />
        </div>
      </section>
      <PopularTools />
      <section className="py-4" style={{ background: 'var(--clr-surface)' }}>
        <div className="container">
          <AdBanner label="Advertisement · Google AdSense Banner (728 x 90)" />
        </div>
      </section>
      <HowItWorks />
      <LiveGenerator />
      <WhyChooseUs />
      <FAQ />
    </main>
  )
}
