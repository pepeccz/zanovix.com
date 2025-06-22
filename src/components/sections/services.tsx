"use client"; // Mark as client component for framer-motion

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { TextAnimate } from '@/components/ui/magic/text-animate';
import { AnimatedBeam } from '@/components/ui/magic/animated-beam';
import { Phone, ArrowRight } from 'lucide-react';

const sectionTitleVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", delay: 0.1 } },
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6, 
      ease: "easeOut",
      delay: 0.3
    } 
  },
};

const highlightVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { 
      duration: 0.5, 
      ease: "easeOut",
      delay: 0.6
    } 
  },
};

const warningVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5, 
      ease: "easeOut",
      delay: 0.8
    } 
  },
};

const buttonVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5, 
      ease: "easeOut",
      delay: 1.0
    } 
  },
};

export default function ServicesSection() {
  const handleContactClick = () => {
    const contactSection = document.getElementById('contact-form');
    if (contactSection) {
      contactSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section id="services" className="py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background">
        <AnimatedBeam className="opacity-20" numBeams={8} gradientStartColor="rgba(62, 167, 137, 0.3)" gradientStopColor="rgba(62, 167, 137, 0.1)" />
      </div>

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-primary/5 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ amount: 0.3 }}
          variants={sectionTitleVariants}
        >
          <h2 className="glowing-border inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-primary hover:[animation-play-state:paused]">
            Nuestros Servicios
          </h2>
          
          <div className="mt-8 space-y-8">
            <motion.div
              variants={contentVariants}
              className="text-lg md:text-xl text-foreground leading-relaxed"
            >
              <TextAnimate
                animation="fadeIn"
                by="word"
                className="block mb-6"
              >
                Ofrecemos todas las soluciones que engloba el mundo de la Inteligencia Artificial para empresas que quieren escalar.
              </TextAnimate>
            </motion.div>

            {/* Cuadro verde destacado */}
            <motion.div
              variants={highlightVariants}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-primary/10 to-green-500/10 rounded-xl blur-xl"></div>
              <div className="relative bg-gradient-to-r from-green-50 to-primary/5 dark:from-green-950/20 dark:to-primary/10 border border-green-200 dark:border-green-800 rounded-xl p-8">
                <div className="text-lg md:text-xl font-semibold text-green-800 dark:text-green-200 leading-relaxed">
                  <TextAnimate
                    animation="blurInUp"
                    by="word"
                    delay={0.1}
                    className="block"
                  >
                    Somos expertos en IA aplicada. Si tu negocio tiene un cuello de botella o pierde mucho tiempo en otros flujos de trabajo, podemos automatizarlo.
                  </TextAnimate>
                </div>
              </div>
            </motion.div>

            {/* Texto de advertencia sin cuadro */}
            <motion.div
              variants={warningVariants}
              className="text-lg md:text-xl text-foreground leading-relaxed"
            >
              <TextAnimate
                animation="fadeIn"
                by="word"
                delay={0.1}
                className="block mb-4"
              >
                Pero si tu empresa aún no sabe lo que es un agente inteligente de inteligencia artificial, <span className="font-bold text-red-600 dark:text-red-400">NO NOS LLAMES.</span>
              </TextAnimate>
              
              <TextAnimate
                animation="fadeIn"
                by="word"
                delay={0.3}
                className="block text-muted-foreground"
              >
                Todavía no estás listo para trabajar con nosotros.
              </TextAnimate>
            </motion.div>

            {/* Botón de contactar */}
            <motion.div
              variants={buttonVariants}
              className="flex justify-center pt-8"
            >
              <Button 
                size="lg" 
                className="group px-8 py-4 text-lg font-semibold"
                onClick={handleContactClick}
              >
                <Phone className="h-5 w-5 mr-2" />
                <span>Contactar</span>
                <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}