"use client"; // Mark as client component for framer-motion

import { motion } from 'framer-motion';
import { TextAnimate } from '@/components/ui/magic/text-animate';
import { AnimatedBeam } from '@/components/ui/magic/animated-beam';

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

const warningVariants = {
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

export default function ServicesSection() {
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
              
              <TextAnimate
                animation="fadeIn"
                by="word"
                delay={0.2}
                className="block"
              >
                Somos expertos en IA aplicada. Si tu negocio tiene un cuello de botella o pierde mucho tiempo en otros flujos de trabajo, podemos automatizarlo.
              </TextAnimate>
            </motion.div>

            <motion.div
              variants={warningVariants}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-500/10 rounded-xl blur-xl"></div>
              <div className="relative bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border border-red-200 dark:border-red-800 rounded-xl p-8">
                <div className="text-lg md:text-xl font-semibold text-red-800 dark:text-red-200 leading-relaxed">
                  <TextAnimate
                    animation="blurInUp"
                    by="word"
                    delay={0.1}
                    className="block mb-4"
                  >
                    Pero si tu empresa aún no sabe lo que es un agente inteligente de inteligencia artificial, <span className="font-bold text-red-900 dark:text-red-100">NO NOS LLAMES.</span>
                  </TextAnimate>
                  
                  <TextAnimate
                    animation="blurInUp"
                    by="word"
                    delay={0.3}
                    className="block text-red-700 dark:text-red-300"
                  >
                    Todavía no estás listo para trabajar con nosotros.
                  </TextAnimate>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}