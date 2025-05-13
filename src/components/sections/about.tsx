"use client"; // Mark as client component for framer-motion

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { MagicCard } from '@/components/ui/magic-card';
import { TextAnimate } from '@/components/ui/magic/text-animate';
import { Calendar, Clock, Sparkles } from 'lucide-react';

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

export default function AboutSection() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const centerX = rect.left + width / 2;
    const centerY = rect.top + height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
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
              Nuestra Historia
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
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              perspective: 1000,
              rotateX,
              rotateY,
            }}
          >
            <MagicCard className="h-full w-full">
              <div className="w-full h-full overflow-hidden rounded-lg">
                {/* Usar una imagen estática con dimensiones fijas en lugar de fill */}
                <img
                  src="/perfil.webp"
                  alt="Pepe Cabeza, fundador de Zanovix AI"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
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
                Nuestra Historia
                <motion.div
                  variants={floatingIconVariants}
                  initial="initial"
                  animate="animate"
                >
                  <Sparkles className="h-6 w-6 text-primary" />
                </motion.div>
              </motion.h3>
            </div>

            <motion.div variants={paragraphVariants} className="mb-6">
              <TextAnimate
                animation="fadeIn"
                by="word"
                className="text-lg text-muted-foreground"
              >
                Soy Pepe Cabeza, fundador de Zanovix, y desde siempre he tenido una extraña obsesión: automatizar TODO lo que no me aportaba nada.
              </TextAnimate>
            </motion.div>

            <motion.div variants={paragraphVariants} className="mb-4">
              <TextAnimate
                animation="fadeIn"
                by="word"
                delay={0.1}
                className="text-lg text-muted-foreground"
              >
                Todo empezó en el instituto. Mientras muchos hacían sus deberes a mano, yo prefería crear pequeños sistemas para que los hicieran por mí. No por flojo (bueno, un poco sí 😅), sino porque me fascinaba la idea de que una máquina pudiera liberarte tiempo para lo realmente importante.
              </TextAnimate>
            </motion.div>

            <motion.div variants={paragraphVariants} className="mb-8">
              <TextAnimate
                animation="fadeIn"
                by="word"
                delay={0.2}
                className="text-lg text-muted-foreground"
              >
                Esa mentalidad me llevó a estudiar programación, y más tarde, a enamorarme de la inteligencia artificial. Desde entonces, he ayudado a negocios locales, emprendedores y equipos de trabajo a recuperar el activo más importante que tenemos: el tiempo.
              </TextAnimate>
            </motion.div>

            <motion.div variants={paragraphVariants} className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="group">
                <Link href="/consultoria" className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>Agendar consultoría gratis</span>
                  <Clock className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:rotate-12" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
