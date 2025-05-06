
// Placeholder page for /formacion-consultoria
"use client"; // Add this for useState and useEffect

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import React, { useState, useEffect } from 'react'; // Import React and hooks
import { cn } from '@/lib/utils'; // Import cn for conditional classes

export default function FormacionConsultoriaPage() {
  const [showStickyButton, setShowStickyButton] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlButtonVisibility = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;
        // Show button if scrolling down and past a certain point (e.g., 200px)
        if (currentScrollY > 200 && currentScrollY > lastScrollY) {
          setShowStickyButton(true);
        } else if (currentScrollY < lastScrollY || currentScrollY <= 200) {
          // Hide button if scrolling up or near the top
          setShowStickyButton(false);
        }
        setLastScrollY(currentScrollY);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlButtonVisibility);
      controlButtonVisibility(); // Initial check

      return () => {
        window.removeEventListener('scroll', controlButtonVisibility);
      };
    }
  }, [lastScrollY]);

  return (
    <>
      <div className="container mx-auto min-h-[calc(100vh-10rem)] py-16 px-4">
        <h1 className="text-4xl font-bold mb-6">Formación y Consultoría IA</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
          Impulsamos el conocimiento y la estrategia de IA dentro de tu organización. Nuestros servicios de formación y consultoría están diseñados para capacitar a tus equipos y alinear la inteligencia artificial con tus objetivos de negocio.
        </p>

        <div className="space-y-12">
          {/* Section 1: Formación */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Programas de Formación a Medida</h2>
            <p className="mb-4 text-foreground/90">
              Ofrecemos workshops interactivos y programas de formación continuada adaptados a las necesidades específicas de tus equipos, desde niveles introductorios hasta avanzados en áreas como:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 text-foreground/90">
              <li>Fundamentos de Inteligencia Artificial y Machine Learning.</li>
              <li>Aplicaciones prácticas de IA en tu sector.</li>
              <li>Herramientas y plataformas de IA (e.g., Python, TensorFlow, PyTorch, APIs de OpenAI/Google).</li>
              <li>Ética y responsabilidad en IA.</li>
              <li>Gestión de proyectos de IA.</li>
            </ul>
            {/* This Button will inherit data-cursor-hover-target="true" */}
            <Button variant="link" className="p-0 text-primary hidden sm:inline-flex" asChild>
              <Link href="/consultoria">
                Solicitar información sobre formación <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Section 2: Consultoría */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Consultoría Estratégica de IA</h2>
            <p className="mb-4 text-foreground/90">
              Te ayudamos a navegar el complejo panorama de la IA y a tomar decisiones informadas:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 text-foreground/90">
              <li>Evaluación de oportunidades de IA en tu negocio.</li>
              <li>Definición de hojas de ruta y estrategias de implementación.</li>
              <li>Selección de tecnologías y proveedores adecuados.</li>
              <li>Diseño de arquitecturas de datos para IA.</li>
              <li>Asesoramiento en la creación de equipos de IA internos.</li>
              <li>Auditoría y optimización de modelos existentes.</li>
            </ul>
            {/* This Button will inherit data-cursor-hover-target="true" */}
            <Button variant="link" className="p-0 text-primary hidden sm:inline-flex" asChild>
              <Link href="/consultoria">
                Agendar consultoría estratégica <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* This Button will inherit data-cursor-hover-target="true" */}
        <Button variant="outline" className="mt-12" asChild>
          <Link href="/">Volver al Inicio</Link>
        </Button>
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
