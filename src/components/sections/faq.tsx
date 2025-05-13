"use client"; // Mark as client component for framer-motion

import { useRef } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from 'framer-motion';
import { TextAnimate, RetroGrid } from '@/components/ui/magic';

const faqItems = [
  {
    question: "¿Qué es un agente de inteligencia artificial?",
    answer: "Un agente de IA es un sistema autónomo que percibe su entorno a través de sensores y actúa sobre ese entorno a través de actuadores para lograr objetivos específicos. Puede aprender, razonar y tomar decisiones."
  },
  {
    question: "¿Cómo funcionan los agentes de IA en el entorno empresarial?",
    answer: "Automatizan tareas repetitivas, analizan grandes volúmenes de datos para extraer insights, interactúan con clientes (chatbots), optimizan procesos logísticos, apoyan la toma de decisiones y personalizan experiencias, mejorando la eficiencia y la competitividad."
  },
  {
    question: "¿Qué tipos de tareas pueden realizar los agentes de IA?",
    answer: "Pueden realizar una amplia gama de tareas, como atención al cliente 24/7, análisis predictivo de ventas, procesamiento y clasificación de documentos, monitorización de sistemas, optimización de rutas, traducción automática, generación de contenido y mucho más."
  },
  {
    question: "¿Qué es Retrieval Augmented Generation (RAG)?",
    answer: "RAG es una técnica que mejora la capacidad de los modelos de lenguaje grandes (LLMs) combinándolos con un sistema de recuperación de información. Antes de generar una respuesta, el sistema busca y recupera datos relevantes de una base de conocimiento externa (como tus documentos), proporcionando contexto al LLM para generar respuestas más precisas y actualizadas."
  },
  {
    question: "¿Qué ventajas ofrece RAG frente a otros sistemas de búsqueda?",
    answer: "RAG proporciona respuestas más precisas, contextualizadas y basadas en información específica y actualizada de tu base de conocimiento. Reduce las 'alucinaciones' (respuestas inventadas) del LLM y permite citar las fuentes de la información."
  },
  {
    question: "¿Cómo asegura RAG que la información proporcionada es relevante?",
    answer: "El componente de 'recuperación' (Retrieval) busca en la base de conocimiento documentos o fragmentos de texto que sean semánticamente similares a la pregunta del usuario. Solo esta información relevante se pasa al modelo generativo, asegurando que la respuesta se base en el contexto adecuado."
  },
  {
    question: "¿Qué tipo de documentos pueden integrarse en el sistema RAG?",
    answer: "Se pueden integrar diversos formatos, como PDFs, documentos de Word (.docx), archivos de texto (.txt), páginas web, entradas de bases de datos, artículos de bases de conocimiento, transcripciones, etc. El sistema necesita indexar estos documentos previamente."
  },
  {
    question: "¿Es seguro utilizar RAG para consultas sensibles?",
    answer: "La seguridad depende de la implementación y de los controles de acceso de la base de conocimiento subyacente. Si se implementa correctamente, respetando la privacidad y los permisos de acceso a los datos, RAG puede ser seguro para consultas sensibles."
  },
  {
    question: "¿Qué es la automatización impulsada por IA?",
    answer: "Es el uso de tecnologías de inteligencia artificial para automatizar procesos y tareas empresariales que normalmente requerirían intervención humana, especialmente aquellas que involucran toma de decisiones, reconocimiento de patrones o procesamiento de lenguaje natural."
  },
  {
    question: "¿Cómo puede ayudar la automatización en un negocio?",
    answer: "La automatización puede gestionar tareas como el procesamiento de datos, generación de informes, atención al cliente básica, envío de correos personalizados, clasificación de documentos y mucho más, liberando tiempo para que los empleados se concentren en actividades estratégicas y de mayor valor añadido."
  },
  {
    question: "¿Cuáles son los casos de uso comunes de los agentes de IA?",
    answer: (
      <ul className="list-disc list-inside space-y-1">
        <li><strong>Atención al cliente:</strong> Responden preguntas frecuentes, guían a los usuarios, gestionan tickets de soporte iniciales.</li>
        <li><strong>Análisis de datos:</strong> Identifican tendencias, generan informes y visualizaciones, predicen resultados.</li>
        <li><strong>Gestión documental:</strong> Buscan información específica en grandes volúmenes de documentos, clasifican y resumen textos.</li>
        <li><strong>Automatización de Marketing:</strong> Personalizan campañas, segmentan audiencias, optimizan pujas publicitarias.</li>
      </ul>
    )
  },
];

const sectionTitleVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", delay: 0.1 } },
};

const accordionContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Stagger the animation of each AccordionItem
      delayChildren: 0.2,
      ease: "easeOut"
    },
  },
};

const accordionItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function FaqSection() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="relative py-16 md:py-24 bg-muted/30 dark:bg-muted/10 overflow-hidden"
    >
      {/* Subtle background grid */}
      <RetroGrid
        className="opacity-10"
        angle={45}
        cellSize={80}
        lightLineColor="rgba(62, 167, 137, 0.2)"
        darkLineColor="rgba(62, 167, 137, 0.2)"
        animate={false}
      />

      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          className="mb-12 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ amount: 0.3 }}
          variants={sectionTitleVariants}
        >
          <TextAnimate
            animation="blurInUp"
            by="word"
            className="glowing-border inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-primary hover:[animation-play-state:paused]"
          >
            Preguntas Frecuentes
          </TextAnimate>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ amount: 0.1 }}
          variants={accordionContainerVariants}
          className="relative"
        >
          {/* Add a subtle glow behind the accordion */}
          <div className="absolute inset-0 bg-primary/5 rounded-xl blur-xl -z-10 transform scale-105" />

          <Accordion
            type="single"
            collapsible
            className="mx-auto max-w-3xl backdrop-blur-sm rounded-lg overflow-hidden border border-primary/10 shadow-lg"
          >
            {faqItems.map((item, index) => (
              <motion.div key={index} variants={accordionItemVariants}>
                <AccordionItem
                  value={`item-${index}`}
                  className="border-b border-primary/10 last:border-0"
                >
                  <AccordionTrigger
                    className="text-left text-lg font-medium hover:no-underline px-6 py-4 hover:bg-primary/5 transition-colors duration-200"
                    data-cursor-hover-target="true"
                  >
                    <TextAnimate
                      animation="fadeIn"
                      by="word"
                      once={true}
                      delay={0.1 * index}
                    >
                      {item.question}
                    </TextAnimate>
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground px-6 py-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {item.answer}
                    </motion.div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
