
"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from 'framer-motion';
import { TextAnimate } from '@/components/ui/magic/text-animate';
import { AnimatedBeam } from '@/components/ui/magic/animated-beam';
import { Calendar, Clock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { MagicCard } from '@/components/ui/magic-card';

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

export default function ConsultoriaPage() {
  const [isCalendarLoaded, setIsCalendarLoaded] = useState(false);

  useEffect(() => {
    (async function () {
      try {
        const cal = await getCalApi({"namespace":"consultoria-gratis"});
        cal("ui", {"hideEventTypeDetails":true,"layout":"month_view"});
        setIsCalendarLoaded(true);
      } catch (error) {
        console.error("Error loading Cal.com:", error);
      }
    })();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background">
          <AnimatedBeam className="opacity-20" numBeams={10} gradientStartColor="rgba(62, 167, 137, 0.4)" gradientStopColor="rgba(62, 167, 137, 0.1)" />
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
          >
            <h2 className="glowing-border inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-primary">
              Consultoría Gratuita
            </h2>

            <h1 className="mt-4 text-4xl font-bold tracking-tight mb-6">
              <TextAnimate
                animation="blurInUp"
                by="word"
                className="text-4xl font-bold"
              >
                Agenda tu Sesión de 30 Minutos
              </TextAnimate>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
              Hablemos sobre cómo la inteligencia artificial puede transformar tu negocio. Reserva una sesión gratuita para discutir tus necesidades y explorar posibles soluciones.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="container mx-auto px-4 pb-16">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial="hidden"
          animate="visible"
          variants={staggerContainerVariants}
        >
          {/* Benefits Column */}
          <motion.div
            className="md:col-span-1"
            variants={fadeInUpVariants}
          >
            <MagicCard className="h-full">
              <div className="p-6 h-full flex flex-col">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span>Beneficios de la Consultoría</span>
                </h3>

                <ul className="space-y-4 flex-grow">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    </div>
                    <span className="text-foreground/90">Evaluación personalizada de tus necesidades de IA</span>
                  </li>

                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    </div>
                    <span className="text-foreground/90">Identificación de oportunidades de automatización</span>
                  </li>

                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    </div>
                    <span className="text-foreground/90">Recomendaciones estratégicas para implementación</span>
                  </li>

                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    </div>
                    <span className="text-foreground/90">Estimación de costes y retorno de inversión</span>
                  </li>

                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    </div>
                    <span className="text-foreground/90">Plan de acción concreto para los siguientes pasos</span>
                  </li>
                </ul>

                <div className="mt-6 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Duración: 30 minutos</span>
                  </div>
                  <div className="flex items-center gap-2 text-primary">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">100% Gratuita, sin compromiso</span>
                  </div>
                </div>
              </div>
            </MagicCard>
          </motion.div>

          {/* Calendar Column */}
          <motion.div
            className="md:col-span-2"
            variants={fadeInUpVariants}
          >
            <MagicCard className="h-full">
              <div className="p-0 h-[650px] relative">
                {!isCalendarLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-card">
                    <div className="flex flex-col items-center">
                      <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
                      <p className="text-muted-foreground">Cargando calendario...</p>
                    </div>
                  </div>
                )}
                <Cal
                  namespace="consultoria-gratis"
                  calLink="pepecabeza/consultoria-gratis"
                  style={{width:"100%", height:"100%", overflow:"scroll"}}
                  config={{"layout":"month_view"}}
                />
              </div>
            </MagicCard>
          </motion.div>
        </motion.div>

        {/* Back Button */}
        <div className="mt-12 flex justify-center">
          <Button variant="outline" asChild className="group">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              <span>Volver al Inicio</span>
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}


