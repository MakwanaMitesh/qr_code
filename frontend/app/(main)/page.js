import Hero from '@/components/Hero'
import ToolsStrip from '@/components/ToolsStrip'
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
      <PopularTools />
      <HowItWorks />
      <LiveGenerator />
      <WhyChooseUs />
      <FAQ />
    </main>
  )
}
