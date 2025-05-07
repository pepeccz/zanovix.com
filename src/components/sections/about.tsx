
"use client"; // Mark as client component for framer-motion

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

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


export default function AboutSection() {
  return (
    <section id="about" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Main grid for layout */}
        <div className="grid grid-cols-1 items-center gap-x-12 md:grid-cols-2">
          {/* Title - visible on mobile, hidden on md and up (desktop will show it in the text column) */}
          <motion.div 
            className="md:hidden mb-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionTitleVariants}
          >
            <h2 className="glowing-border inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-primary hover:[animation-play-state:paused]">
              Sobre Nosotros
            </h2>
          </motion.div>

          {/* Image Column - Order 1 on mobile, Order 1 on md and up */}
          <motion.div 
            className="relative aspect-square overflow-hidden rounded-lg shadow-lg order-1"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={imageVariants}
          >
            <Image
              src="/perfil.webp"
              alt="Pepe Cabeza, fundador de Zanovix AI"
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </motion.div>

          {/* Text Content Column - Order 2 on mobile, Order 2 on md and up */}
          <motion.div 
            className="order-2 mt-8 md:mt-0"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={textContentVariants}
          >
            {/* Title - hidden on mobile, visible on md and up */}
            <motion.h2 
              className="glowing-border mb-6 hidden md:inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-primary hover:[animation-play-state:paused]"
              variants={paragraphVariants} // Part of staggered children
            >
              Sobre Nosotros
            </motion.h2>
            <motion.p className="mb-6 text-lg text-muted-foreground" variants={paragraphVariants}>
             Soy Pepe Cabeza, fundador de Zanovix, y desde siempre he tenido una extraña obsesión: automatizar TODO lo que no me aportaba nada.
            </motion.p>
            <motion.p className="mb-4 text-lg text-muted-foreground" variants={paragraphVariants}>
             Todo empezó en el instituto. Mientras muchos hacían sus deberes a mano, yo prefería crear pequeños sistemas para que los hicieran por mí. No por flojo (bueno, un poco sí 😅), sino porque me fascinaba la idea de que una máquina pudiera liberarte tiempo para lo realmente importante.
            </motion.p>
            <motion.p className="text-lg text-muted-foreground mb-8" variants={paragraphVariants}>
             Esa mentalidad me llevó a estudiar programación, y más tarde, a enamorarme de la inteligencia artificial. Desde entonces, he ayudado a negocios locales, emprendedores y equipos de trabajo a recuperar el activo más importante que tenemos: el tiempo.
            </motion.p>
            <motion.div variants={paragraphVariants}>
              <Button asChild size="lg" className="w-full sm:w-auto sm:inline-flex">
                <Link href="/consultoria">
                  Agendar consultoría gratis con Pepe Cabeza
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
