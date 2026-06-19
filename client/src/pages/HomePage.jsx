import CaseAnalysis from '../components/sections/CaseAnalysis'
import DetectionFlow from '../components/sections/DetectionFlow'
import FeatureOverview from '../components/sections/FeatureOverview'
import FooterSection from '../components/sections/FooterSection'
import HeroSection from '../components/sections/HeroSection'
import TechnologyShowcase from '../components/sections/TechnologyShowcase'
import Header from '../components/layout/Header'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#05090c] font-['Manrope'] text-[#f4fbff] antialiased">
      <Header />
      <main className="overflow-hidden">
        <HeroSection />
        <DetectionFlow />
        <CaseAnalysis />
        <FeatureOverview />
        <TechnologyShowcase />
      </main>
      <FooterSection />
    </div>
  )
}
