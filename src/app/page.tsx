import HeroSection from '@/components/sections/hero';
import ServicesSection from '@/components/sections/services';
import TestimonialsSection from '@/components/sections/testimonials';
import AboutSection from '@/components/sections/about';
import FaqSection from '@/components/sections/faq';
import CTASection from '@/components/sections/cta';

export default function Home() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <TestimonialsSection />
      <AboutSection />
      <FaqSection />
      <CTASection />
    </>
  );
}

