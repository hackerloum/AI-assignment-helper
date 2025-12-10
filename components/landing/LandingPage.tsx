'use client'

import { Navigation } from './Navigation'
import { HeroSection } from './HeroSection'
import { QuickTools } from './QuickTools'
import { FeaturesShowcase } from './FeaturesShowcase'
import { HowItWorks } from './HowItWorks'
import { PricingSection } from './PricingSection'
import { SocialProof } from './SocialProof'
import { FAQSection } from './FAQSection'
import { CTASection } from './CTASection'
import { LandingFooter } from './LandingFooter'

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
        <QuickTools />
        <FeaturesShowcase />
        <HowItWorks />
        <SocialProof />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  )
}

