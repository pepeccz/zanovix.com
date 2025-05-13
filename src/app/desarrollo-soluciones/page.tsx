
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRight,
  Code,
  MessageSquare,
  TrendingUp,
  BarChart3,
  FileText,
  Camera,
  Layers,
  Calendar,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MagicCard } from '@/components/ui/magic-card';
import { TextAnimate } from '@/components/ui/magic/text-animate';
import { AnimatedBeam } from '@/components/ui/magic/animated-beam';
import { RetroGrid } from '@/components/ui/magic/retro-grid';

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

const processStepVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (custom: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.1 * custom,
      duration: 0.5,
      ease: "easeOut"
    }
  })
};

interface SolutionCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const SolutionCard = ({ icon: Icon, title, description }: SolutionCardProps) => (
  <motion.div variants={fadeInUpVariants}>
    <MagicCard className="h-full">
      <div className="p-6 flex flex-col h-full">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </MagicCard>
  </motion.div>
);

interface ProcessStepProps {
  number: number;
  title: string;
  description: string;
}

const ProcessStep = ({ number, title, description }: ProcessStepProps) => (
  <motion.div
    className="flex items-start gap-4"
    variants={processStepVariants}
    custom={number}
  >
    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
      {number}
    </div>
    <div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  </motion.div>
);

export default function DesarrolloSolucionesPage() {
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
        <div className="absolute inset-0">
          <RetroGrid
            className="opacity-10"
            angle={45}
            cellSize={80}
            lightLineColor="rgba(62, 167, 137, 0.2)"
            darkLineColor="rgba(62, 167, 137, 0.2)"
            animate={true}
          />
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
                Desarrollo de Soluciones IA a Medida
              </TextAnimate>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
              Transformamos tus ideas y desafíos en soluciones de inteligencia artificial funcionales y de alto impacto. Nos especializamos en crear aplicaciones y sistemas inteligentes adaptados específicamente a las necesidades de tu negocio.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        {/* Solutions Section */}
        <motion.div
          className="mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ amount: 0.2 }}
          variants={staggerContainerVariants}
        >
          <motion.h2
            className="text-3xl font-bold mb-8 flex items-center gap-2 justify-center"
            variants={fadeInUpVariants}
          >
            <Sparkles className="h-7 w-7 text-primary" />
            <span>Tipos de Soluciones que Desarrollamos</span>
          </motion.h2>

          <motion.p
            className="mb-8 text-lg text-muted-foreground text-center max-w-3xl mx-auto"
            variants={fadeInUpVariants}
          >
            Nuestro equipo experto puede construir una amplia gama de soluciones adaptadas a tus necesidades específicas.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <SolutionCard
              icon={Layers}
              title="Automatización Inteligente"
              description="Optimiza tareas repetitivas y mejora la eficiencia operativa con flujos de trabajo automatizados basados en IA."
            />

            <SolutionCard
              icon={MessageSquare}
              title="Chatbots y Asistentes"
              description="Mejora la atención al cliente y la interacción interna con asistentes virtuales personalizados."
            />

            <SolutionCard
              icon={TrendingUp}
              title="Sistemas de Recomendación"
              description="Aumenta el engagement y las ventas con sugerencias personalizadas y relevantes para tus usuarios."
            />

            <SolutionCard
              icon={BarChart3}
              title="Análisis Predictivo"
              description="Anticipa tendencias, optimiza inventarios y predice comportamientos con modelos avanzados."
            />

            <SolutionCard
              icon={FileText}
              title="Procesamiento de Lenguaje"
              description="Extrae insights de texto, clasifica documentos y realiza análisis de sentimientos automáticamente."
            />

            <SolutionCard
              icon={Camera}
              title="Visión por Computadora"
              description="Analiza imágenes y videos para control de calidad, seguridad y reconocimiento de patrones."
            />
          </div>

          <motion.div
            className="flex justify-center"
            variants={fadeInUpVariants}
          >
            <Button asChild size="lg" className="group">
              <Link href="/consultoria" className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>Solicitar demostración</span>
                <ArrowRight className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Process Section */}
        <motion.div
          className="relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ amount: 0.2 }}
          variants={staggerContainerVariants}
        >
          <div className="absolute inset-0 bg-primary/5 rounded-xl -z-10"></div>

          <div className="p-8 rounded-xl">
            <motion.h2
              className="text-3xl font-bold mb-8 flex items-center gap-2 justify-center"
              variants={fadeInUpVariants}
            >
              <Code className="h-7 w-7 text-primary" />
              <span>Nuestro Proceso de Desarrollo</span>
            </motion.h2>

            <motion.p
              className="mb-12 text-lg text-muted-foreground text-center max-w-3xl mx-auto"
              variants={fadeInUpVariants}
            >
              Seguimos una metodología probada para garantizar el éxito de tu proyecto de IA, desde la concepción hasta la implementación.
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-8">
                <ProcessStep
                  number={1}
                  title="Descubrimiento y Definición"
                  description="Entendemos tus objetivos, requisitos y desafíos específicos para definir el alcance del proyecto."
                />

                <ProcessStep
                  number={2}
                  title="Diseño de la Solución"
                  description="Creamos la arquitectura técnica y el plan detallado para el desarrollo de la solución."
                />

                <ProcessStep
                  number={3}
                  title="Desarrollo e Iteración"
                  description="Construimos la solución utilizando metodologías ágiles, con ciclos de feedback constantes."
                />
              </div>

              <div className="space-y-8">
                <ProcessStep
                  number={4}
                  title="Entrenamiento y Validación"
                  description="Aseguramos la precisión y el rendimiento de los modelos de IA con datos reales."
                />

                <ProcessStep
                  number={5}
                  title="Implementación y Despliegue"
                  description="Integramos la solución en tu entorno existente y capacitamos a tu equipo."
                />

                <ProcessStep
                  number={6}
                  title="Monitorización y Mantenimiento"
                  description="Garantizamos el funcionamiento óptimo a largo plazo con soporte continuo."
                />
              </div>
            </div>

            <motion.div
              className="flex justify-center mt-12"
              variants={fadeInUpVariants}
            >
              <Button asChild size="lg" className="group">
                <Link href="/consultoria" className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Discutir tu proyecto de desarrollo</span>
                  <ArrowRight className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
          </div>
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

