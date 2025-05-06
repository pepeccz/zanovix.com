
// Placeholder page for /desarrollo-soluciones
"use client"; // Add this for useState and useEffect

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import React, { useState, useEffect } from 'react'; // Import React and hooks
import { cn } from '@/lib/utils'; // Import cn for conditional classes

export default function DesarrolloSolucionesPage() {
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
        <h1 className="text-4xl font-bold mb-6">Desarrollo de Soluciones de IA a Medida</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
          Transformamos tus ideas y desafíos en soluciones de inteligencia artificial funcionales y de alto impacto. Nos especializamos en crear aplicaciones y sistemas inteligentes adaptados específicamente a las necesidades de tu negocio.
        </p>

        <div className="space-y-12">
          {/* Section 1: Types of Solutions */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Tipos de Soluciones que Desarrollamos</h2>
            <p className="mb-4 text-foreground/90">
              Nuestro equipo experto puede construir una amplia gama de soluciones, incluyendo:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 text-foreground/90">
              <li><strong>Automatización Inteligente de Procesos:</strong> Optimiza tareas repetitivas y mejora la eficiencia operativa.</li>
              <li><strong>Chatbots y Asistentes Virtuales:</strong> Mejora la atención al cliente y la interacción interna.</li>
              <li><strong>Sistemas de Recomendación Personalizados:</strong> Aumenta el engagement y las ventas con sugerencias relevantes.</li>
              <li><strong>Análisis Predictivo y Modelado:</strong> Anticipa tendencias, optimiza inventarios y predice comportamientos.</li>
              <li><strong>Procesamiento del Lenguaje Natural (NLP):</strong> Extrae insights de texto, clasifica documentos, realiza análisis de sentimientos.</li>
              <li><strong>Visión por Computadora:</strong> Analiza imágenes y videos para control de calidad, seguridad, etc.</li>
              <li><strong>Integración de APIs de IA (OpenAI, Google AI, etc.):</strong> Aprovecha modelos pre-entrenados para acelerar el desarrollo.</li>
            </ul>
          </div>

          {/* Section 2: Our Process */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Nuestro Proceso de Desarrollo</h2>
            <ol className="list-decimal list-inside space-y-2 mb-4 text-foreground/90">
              <li><strong>Descubrimiento y Definición:</strong> Entendemos tus objetivos y requisitos.</li>
              <li><strong>Diseño de la Solución:</strong> Creamos la arquitectura y el plan técnico.</li>
              <li><strong>Desarrollo e Iteración:</strong> Construimos la solución utilizando metodologías ágiles.</li>
              <li><strong>Entrenamiento y Validación de Modelos:</strong> Aseguramos la precisión y el rendimiento de la IA.</li>
              <li><strong>Implementación y Despliegue:</strong> Integramos la solución en tu entorno.</li>
              <li><strong>Monitorización y Mantenimiento:</strong> Garantizamos el funcionamiento óptimo a largo plazo.</li>
            </ol>
            {/* This Button will inherit data-cursor-hover-target="true" */}
            <Button variant="link" className="p-0 text-primary hidden sm:inline-flex" asChild>
              <Link href="/consultoria">
                Discutir tu proyecto de desarrollo <ArrowRight className="ml-2 h-4 w-4" />
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
