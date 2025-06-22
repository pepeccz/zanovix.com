"use client"; // Mark as client component for framer-motion

import Link from 'next/link';
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Code, ArrowRight, Sparkles } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { MagicCard } from '@/components/ui/magic-card';
import { AnimatedBeam } from '@/components/ui/magic/animated-beam';

const sectionTitleVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", delay: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const ServiceCard = ({
  href,
  icon: Icon,
  title,
  description,
  content,
  delay
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  content: string;
  delay: number;
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

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

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const contactSection = document.getElementById('contact-form');
    if (contactSection) {
      contactSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ amount: 0.2 }}
      variants={cardVariants}
      transition={{ delay }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
        rotateX,
        rotateY,
      }}
    >
      <div onClick={handleClick} className="cursor-pointer">
        <MagicCard
          className="h-full"
          gradientFrom="#3ea789"
          gradientTo="#3ea789"
          gradientOpacity={0.5}
        >
          <div className="flex flex-col h-full">
            <CardHeader className="bg-muted/30 p-6 relative overflow-hidden">
              <AnimatedBeam className="absolute inset-0 opacity-30" numBeams={5} />
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground relative z-10">
                <Icon className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-semibold relative z-10">{title}</CardTitle>
              <CardDescription className="mt-2 text-muted-foreground relative z-10">
                {description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-6">
              <p className="text-foreground/90">
                {content}
              </p>
            </CardContent>
            <CardFooter className="p-6 pt-0 mt-auto">
              <Button variant="link" className="p-0 text-primary group">
                Contactar ahora
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </CardFooter>
          </div>
        </MagicCard>
      </div>
    </motion.div>
  );
};

export default function ServicesSection() {
  return (
    <section id="services" className="py-16 md:py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="mb-12 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ amount: 0.3 }}
          variants={sectionTitleVariants}
        >
          <h2 className="glowing-border inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-primary hover:[animation-play-state:paused]">
            Nuestros Servicios de IA
          </h2>
          <h3 className="mt-4 text-3xl font-bold tracking-tight">Soluciones de IA para tu negocio</h3>
        </motion.div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <ServiceCard
            href="#contact-form"
            icon={Users}
            title="Formación y Consultoría IA"
            description="Capacitamos a tus equipos y te asesoramos para que integres la IA con éxito."
            content="Potencia las habilidades de tu personal con nuestros programas de formación personalizados. Te guiamos en la definición de estrategias de IA y en la implementación de las herramientas adecuadas para tus necesidades específicas, asegurando una adopción efectiva y sostenible."
            delay={0.2}
          />

          <ServiceCard
            href="#contact-form"
            icon={Code}
            title="Desarrollo de Soluciones IA"
            description="Creamos soluciones de inteligencia artificial a medida para tu negocio."
            content="Desde chatbots inteligentes y sistemas de recomendación hasta análisis predictivo y automatización de procesos. Desarrollamos e implementamos soluciones de IA robustas y escalables que generan un impacto real en tu eficiencia y resultados."
            delay={0.4}
          />
        </div>
      </div>
    </section>
  );
}