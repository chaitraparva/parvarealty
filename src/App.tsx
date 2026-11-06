import { ThemeProvider } from './context/ThemeContext'
import Nav from './components/Nav'
import Hero from './components/Hero'
import WhyDubai from './components/WhyDubai'
import WhyParva from './components/WhyParva'
import InvestmentBenefits from './components/InvestmentBenefits'
import PropertyCatalogue from './components/PropertyCatalogue'
import DubaiMap from './components/DubaiMap'
import ROICalculator from './components/ROICalculator'
import InvestorJourney from './components/InvestorJourney'
import Testimonials from './components/Testimonials'
import TrustCentre from './components/TrustCentre'
import KnowledgeHub from './components/KnowledgeHub'
import Schedule from './components/Schedule'
import AIConcierge from './components/AIConcierge'
import Footer from './components/Footer'
import SoldTeaser from './components/SoldTeaser'

function AppInner() {
  return (
    <div className="min-h-screen relative" style={{ background: 'var(--bg-a)' }}>
      <div className="noise-bg" aria-hidden="true" />
      <SoldTeaser />
      <Nav />
      <main>
        <section id="hero"><Hero /></section>
        <section id="why-dubai"><WhyDubai /></section>
        <section id="why-parva"><WhyParva /></section>
        <section id="investment"><InvestmentBenefits /></section>
        <section id="properties"><PropertyCatalogue /></section>
        <section id="map"><DubaiMap /></section>
        <section id="calculator"><ROICalculator /></section>
        <section id="journey"><InvestorJourney /></section>
        <section id="testimonials"><Testimonials /></section>
        <section id="trust"><TrustCentre /></section>
        <section id="knowledge"><KnowledgeHub /></section>
        <section id="consultation"><Schedule /></section>
      </main>
      <Footer />
      <AIConcierge />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  )
}
