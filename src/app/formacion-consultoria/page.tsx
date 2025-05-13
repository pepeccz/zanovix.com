
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, BookOpen, Users, Brain, Lightbulb, BarChart, Calendar, Clock } from "lucide-react";
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MagicCard } from '@/components/ui/magic-card';
import { TextAnimate } from '@/components/ui/magic/text-animate';
import { AnimatedBeam } from '@/components/ui/magic/animated-beam';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const fadeInUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  },
};

const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

interface ServiceCardProps {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}

const ServiceCard = ({ icon: Icon, title, children }: ServiceCardProps) => (
  <motion.div variants={fadeInUpVariants}>
    <MagicCard className="h-full">
      <CardHeader className="bg-muted/30 p-6 relative overflow-hidden">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Icon className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {children}
      </CardContent>
    </MagicCard>
  </motion.div>
);

export default function FormacionConsultoriaPage() {
  const [showStickyButton, setShowStickyButton] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);

  useEffect(() => {
    const controlButtonVisibility = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;
        if (currentScrollY > 200 && currentScrollY > lastScrollY) {
          setShowStickyButton(true);
        } else if (currentScrollY < lastScrollY || currentScrollY <= 200) {
          setShowStickyButton(false);
        }
        setLastScrollY(currentScrollY);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlButtonVisibility);
      controlButtonVisibility();

      return () => {
        window.removeEventListener('scroll', controlButtonVisibility);
      };
    }
  }, [lastScrollY]);

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background">
          <AnimatedBeam className="opacity-20" numBeams={8} gradientStartColor="rgba(62, 167, 137, 0.4)" gradientStopColor="rgba(62, 167, 137, 0.1)" />
        </div>

        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-primary/5 blur-3xl"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ opacity, scale }}
          >
            <h2 className="glowing-border inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-primary">
              Servicios
            </h2>

            <h1 className="mt-4 text-4xl font-bold tracking-tight mb-6">
              <TextAnimate
                animation="blurInUp"
                by="word"
                className="text-4xl font-bold"
              >
                Formación y Consultoría IA
              </TextAnimate>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
              Impulsamos el conocimiento y la estrategia de IA dentro de tu organización. Nuestros servicios están diseñados para capacitar a tus equipos y alinear la inteligencia artificial con tus objetivos de negocio.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        {/* Formación Section */}
        <motion.div
          className="mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ amount: 0.2 }}
          variants={staggerContainerVariants}
        >
          <motion.h2
            className="text-3xl font-bold mb-8 flex items-center gap-2"
            variants={fadeInUpVariants}
          >
            <BookOpen className="h-7 w-7 text-primary" />
            Programas de Formación a Medida
          </motion.h2>

          <motion.p
            className="mb-8 text-lg text-muted-foreground"
            variants={fadeInUpVariants}
          >
            Ofrecemos workshops interactivos y programas de formación continuada adaptados a las necesidades específicas de tus equipos, desde niveles introductorios hasta avanzados.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <ServiceCard icon={Brain} title="Fundamentos de IA">
              <ul className="space-y-2 text-foreground/90">
                <li>• Conceptos básicos de Machine Learning</li>
                <li>• Tipos de algoritmos y modelos</li>
                <li>• Casos de uso prácticos</li>
                <li>• Tendencias actuales en IA</li>
              </ul>
            </ServiceCard>

            <ServiceCard icon={Lightbulb} title="Aplicaciones Prácticas">
              <ul className="space-y-2 text-foreground/90">
                <li>• Soluciones específicas para tu sector</li>
                <li>• Integración de IA en procesos existentes</li>
                <li>• Automatización inteligente</li>
                <li>• Análisis predictivo para tu negocio</li>
              </ul>
            </ServiceCard>

            <ServiceCard icon={BarChart} title="Herramientas y Plataformas">
              <ul className="space-y-2 text-foreground/90">
                <li>• APIs de OpenAI, Google y Azure</li>
                <li>• Frameworks como TensorFlow y PyTorch</li>
                <li>• Herramientas de desarrollo de IA</li>
                <li>• Plataformas no-code para IA</li>
              </ul>
            </ServiceCard>
          </div>

          <motion.div
            className="flex justify-center"
            variants={fadeInUpVariants}
          >
            <Button asChild size="lg" className="group">
              <Link href="/consultoria" className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>Solicitar información sobre formación</span>
                <ArrowRight className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Consultoría Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ amount: 0.2 }}
          variants={staggerContainerVariants}
        >
          <motion.h2
            className="text-3xl font-bold mb-8 flex items-center gap-2"
            variants={fadeInUpVariants}
          >
            <Users className="h-7 w-7 text-primary" />
            Consultoría Estratégica de IA
          </motion.h2>

          <motion.p
            className="mb-8 text-lg text-muted-foreground"
            variants={fadeInUpVariants}
          >
            Te ayudamos a navegar el complejo panorama de la IA y a tomar decisiones informadas que maximicen el retorno de tu inversión en tecnología.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <motion.div variants={fadeInUpVariants}>
              <MagicCard className="h-full">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Evaluación y Estrategia</h3>
                  <ul className="space-y-3 text-foreground/90">
                    <li className="flex items-start gap-2">
                      <div className="mt-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                      </div>
                      <span>Evaluación de oportunidades de IA en tu negocio</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                      </div>
                      <span>Definición de hojas de ruta y estrategias de implementación</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                      </div>
                      <span>Análisis de retorno de inversión (ROI) para proyectos de IA</span>
                    </li>
                  </ul>
                </CardContent>
              </MagicCard>
            </motion.div>

            <motion.div variants={fadeInUpVariants}>
              <MagicCard className="h-full">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Implementación y Optimización</h3>
                  <ul className="space-y-3 text-foreground/90">
                    <li className="flex items-start gap-2">
                      <div className="mt-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                      </div>
                      <span>Selección de tecnologías y proveedores adecuados</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                      </div>
                      <span>Diseño de arquitecturas de datos para IA</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                      </div>
                      <span>Auditoría y optimización de modelos existentes</span>
                    </li>
                  </ul>
                </CardContent>
              </MagicCard>
            </motion.div>
          </div>

          <motion.div
            className="flex justify-center"
            variants={fadeInUpVariants}
          >
            <Button asChild size="lg" className="group">
              <Link href="/consultoria" className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>Agendar consultoría estratégica</span>
                <ArrowRight className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Back Button */}
        <div className="mt-16 flex justify-center">
          <Button variant="outline" asChild>
            <Link href="/">Volver al Inicio</Link>
          </Button>
        </div>
      </div>

      {/* Sticky CTA Button for Mobile */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-40 bg-background/80 p-3 backdrop-blur-sm border-t sm:hidden transition-transform duration-300 ease-in-out',
          showStickyButton ? 'translate-y-0' : 'translate-y-full'
        )}
        aria-hidden={!showStickyButton}
      >
        <Button className="w-full" size="lg" asChild>
          <Link href="/consultoria">Agendar consultoría gratuita</Link>
        </Button>
      </div>
    </>
  );
}
