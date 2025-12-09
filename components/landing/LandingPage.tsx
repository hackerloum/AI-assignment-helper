'use client'

import { Navigation } from './Navigation'
import { HeroSection } from './HeroSection'
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

