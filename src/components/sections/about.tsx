"use client"; // Mark as client component for framer-motion

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MagicCard } from '@/components/ui/magic-card';
import { TextAnimate } from '@/components/ui/magic/text-animate';
import { Calendar, Clock, Sparkles, Target, TrendingDown, Zap, Users } from 'lucide-react';

const sectionTitleVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut", delay: 0.2 } },
};

const textContentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
      ease: "easeOut"
    },
  },
};

const paragraphVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const floatingIconVariants = {
  initial: { y: 0 },
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const pointVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function AboutSection() {
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
    <section id="about" className="py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-40 left-20 w-72 h-72 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute bottom-40 right-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Main grid for layout */}
        <div className="grid grid-cols-1 items-center gap-x-12 md:grid-cols-5">
          {/* Title - visible on mobile, hidden on md and up (desktop will show it in the text column) */}
          <motion.div
            className="md:hidden mb-8 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.3, once: false }}
            variants={sectionTitleVariants}
          >
            <h2 className="glowing-border inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-primary hover:[animation-play-state:paused]">
              Sobre Nosotros
            </h2>
            <h3 className="mt-4 text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
              Nuestra Propuesta
              <motion.div
                variants={floatingIconVariants}
                initial="initial"
                animate="animate"
              >
                <Sparkles className="h-6 w-6 text-primary" />
              </motion.div>
            </h3>
          </motion.div>

          {/* Image Column - Order 1 on mobile, Order 1 on md and up */}
          <motion.div
            className="relative aspect-square overflow-hidden order-1 md:col-span-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.25, once: false }}
            variants={imageVariants}
          >
            <MagicCard className="h-full w-full">
              <div className="w-full h-full overflow-hidden rounded-lg">
                {/* Imagen centrada mostrando más del cuerpo, sin animaciones de hover */}
                <img
                  src="/yo.webp"
                  alt="Pepe Cabeza, fundador de Zanovix AI"
                  className="w-full h-full object-cover object-[center_35%]"
                />
              </div>
            </MagicCard>
          </motion.div>

          {/* Text Content Column - Order 2 on mobile, Order 2 on md and up */}
          <motion.div
            className="order-2 mt-8 md:mt-0 md:col-span-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.15, once: false }}
            variants={textContentVariants}
          >
            {/* Title - hidden on mobile, visible on md and up */}
            <div className="mb-6 hidden md:block">
              <motion.h2
                className="glowing-border inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-primary hover:[animation-play-state:paused]"
                variants={paragraphVariants} // Part of staggered children
              >
                Sobre Nosotros
              </motion.h2>
              <motion.h3
                className="mt-4 text-3xl font-bold tracking-tight flex items-center gap-2"
                variants={paragraphVariants}
              >
                Nuestra Propuesta
                <motion.div
                  variants={floatingIconVariants}
                  initial="initial"
                  animate="animate"
                >
                  <Sparkles className="h-6 w-6 text-primary" />
                </motion.div>
              </motion.h3>
            </div>

            <motion.div variants={paragraphVariants} className="mb-8">
              <TextAnimate
                animation="fadeIn"
                by="word"
                className="text-xl font-semibold text-foreground mb-6"
              >
                Si eres CEO / CTO / CIO / DIRECTOR IT, solo te decimos 4 cosas:
              </TextAnimate>
            </motion.div>

            {/* Cuatro puntos principales con iconos */}
            <motion.div variants={paragraphVariants} className="space-y-6 mb-8">
              <motion.div 
                variants={pointVariants}
                className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-transparent border-l-4 border-primary"
              >
                <div className="flex-shrink-0 mt-1">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <TextAnimate
                    animation="fadeIn"
                    by="word"
                    delay={0.1}
                    className="text-lg font-semibold text-foreground"
                  >
                    Aportamos más valor que el resto.
                  </TextAnimate>
                </div>
              </motion.div>

              <motion.div 
                variants={pointVariants}
                className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-transparent border-l-4 border-primary"
              >
                <div className="flex-shrink-0 mt-1">
                  <TrendingDown className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <TextAnimate
                    animation="fadeIn"
                    by="word"
                    delay={0.2}
                    className="text-lg font-semibold text-foreground"
                  >
                    Peleamos por tener la rotación más baja.
                  </TextAnimate>
                </div>
              </motion.div>

              <motion.div 
                variants={pointVariants}
                className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-transparent border-l-4 border-primary"
              >
                <div className="flex-shrink-0 mt-1">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <TextAnimate
                    animation="fadeIn"
                    by="word"
                    delay={0.3}
                    className="text-lg font-semibold text-foreground"
                  >
                    Trabajamos con los mejores desarrolladores.
                  </TextAnimate>
                </div>
              </motion.div>

              <motion.div 
                variants={pointVariants}
                className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-transparent border-l-4 border-primary"
              >
                <div className="flex-shrink-0 mt-1">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <TextAnimate
                    animation="fadeIn"
                    by="word"
                    delay={0.4}
                    className="text-lg font-semibold text-foreground"
                  >
                    Somos eficientes en nuestros procesos de venta.
                  </TextAnimate>
                </div>
              </motion.div>
            </motion.div>

            <motion.div variants={paragraphVariants} className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="group" onClick={handleContactClick}>
                <div className="flex items-center gap-2 cursor-pointer">
                  <Calendar className="h-5 w-5" />
                  <span>Contactar ahora</span>
                  <Clock className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:rotate-12" />
                </div>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}