import HeroSection from '@/components/sections/hero';
import ServicesSection from '@/components/sections/services';
import TestimonialsSection from '@/components/sections/testimonials';
import AboutSection from '@/components/sections/about';
import ContactFormSection from '@/components/sections/contact-form';
import FaqSection from '@/components/sections/faq';

export default function Home() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <TestimonialsSection />
      <AboutSection />
      <ContactFormSection />
      <FaqSection />
    </>
  );
}