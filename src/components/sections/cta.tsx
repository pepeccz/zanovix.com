"use client";

import { NavigationButton } from '@/components/ui/navigation-button';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { TextAnimate } from '@/components/ui/magic/text-animate';
import { AnimatedBeam } from '@/components/ui/magic/animated-beam';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const buttonVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.3,
      yoyo: Infinity,
      ease: "easeInOut",
    },
  },
};

export default function CTASection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background with animated beam effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background">
        <AnimatedBeam className="opacity-30" numBeams={15} gradientStartColor="rgba(62, 167, 137, 0.5)" gradientStopColor="rgba(62, 167, 137, 0.1)" />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-primary/5 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ amount: 0.3 }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <h2 className="glowing-border inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-primary hover:[animation-play-state:paused]">
              ¿Listo para empezar?
            </h2>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-4">
            <TextAnimate
              animation="blurInUp"
              by="word"
              className="text-4xl font-bold tracking-tight"
            >
              Transforma tu negocio con IA
            </TextAnimate>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Agenda una consultoría gratuita de 30 minutos para descubrir cómo la inteligencia artificial puede potenciar tu empresa y automatizar procesos.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.div
              initial="initial"
              whileHover="hover"
              variants={buttonVariants}
            >
              <NavigationButton href="/consultoria" size="lg" className="w-full sm:w-auto group">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>Agendar consultoría gratuita</span>
                  <ArrowRight className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </NavigationButton>
            </motion.div>

            <NavigationButton href="/desarrollo-soluciones" variant="outline" size="lg" className="w-full sm:w-auto">
              Explorar soluciones
            </NavigationButton>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Sin compromiso • Personalizada • 100% confidencial</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}



