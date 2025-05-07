
"use client"; // Mark as client component for framer-motion

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Code, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const sectionTitleVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", delay: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function ServicesSection() {
  return (
    <section id="services" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          className="mb-12 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionTitleVariants}
        >
           <h2 className="glowing-border inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-primary hover:[animation-play-state:paused]">
             Nuestros Servicios de IA
           </h2>
        </motion.div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={cardVariants}
            transition={{ delay: 0.2 }} // Stagger first card
          >
            <Link href="/formacion-consultoria" passHref legacyBehavior>
              <a className="block group h-full"> 
                <Card 
                  className="flex flex-col overflow-hidden shadow-lg transition-all duration-300 ease-in-out group-hover:shadow-2xl group-hover:border-primary group-hover:scale-105 dark:border-border/50 h-full"
                  data-cursor-hover-target="true"
                >
                  <CardHeader className="bg-muted/50 p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Users className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl font-semibold">Formación y Consultoría IA</CardTitle>
                    <CardDescription className="mt-2 text-muted-foreground">
                      Capacitamos a tus equipos y te asesoramos para que integres la IA con éxito.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow p-6">
                    <p className="text-foreground/90">
                      Potencia las habilidades de tu personal con nuestros programas de formación personalizados. Te guiamos en la definición de estrategias de IA y en la implementación de las herramientas adecuadas para tus necesidades específicas, asegurando una adopción efectiva y sostenible.
                    </p>
                  </CardContent>
                  <CardFooter className="p-6 pt-0 mt-auto">
                    <Button variant="link" className="p-0 text-primary" tabIndex={-1}>
                      Saber más <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </a>
            </Link>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={cardVariants}
            transition={{ delay: 0.4 }} // Stagger second card
          >
            <Link href="/desarrollo-soluciones" passHref legacyBehavior>
              <a className="block group h-full">
                <Card 
                  className="flex flex-col overflow-hidden shadow-lg transition-all duration-300 ease-in-out group-hover:shadow-2xl group-hover:border-primary group-hover:scale-105 dark:border-border/50 h-full"
                  data-cursor-hover-target="true"
                >
                  <CardHeader className="bg-muted/50 p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Code className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl font-semibold">Desarrollo de Soluciones IA</CardTitle>
                    <CardDescription className="mt-2 text-muted-foreground">
                      Creamos soluciones de inteligencia artificial a medida para tu negocio.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow p-6">
                    <p className="text-foreground/90">
                      Desde chatbots inteligentes y sistemas de recomendación hasta análisis predictivo y automatización de procesos. Desarrollamos e implementamos soluciones de IA robustas y escalables que generan un impacto real en tu eficiencia y resultados.
                    </p>
                  </CardContent>
                  <CardFooter className="p-6 pt-0 mt-auto">
                    <Button variant="link" className="p-0 text-primary" tabIndex={-1}>
                      Saber más <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </a>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
