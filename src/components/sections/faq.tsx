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
    question: "¿Qué procesos de mi empresa se pueden automatizar con IA?",
    answer: "Cualquier tarea repetitiva o basada en reglas: atención al cliente, gestión de agendas, seguimiento de presupuestos, clasificación de correos, generación de informes, recomendación de productos, etc."
  },
  {
    question: "¿Cómo sabéis qué tipo de IA aplicar a mi caso?",
    answer: "Primero analizamos tus procesos clave. Luego proponemos la solución más eficiente: IA generativa, sistemas RAG, chatbots, flujos con n8n, o una combinación de herramientas."
  },
  {
    question: "¿Cuánto tiempo tarda en implementarse un sistema?",
    answer: "Depende de la complejidad. Algunos agentes están operativos en 3 días; soluciones más avanzadas pueden tardar de 2 a 4 semanas."
  },
  {
    question: "¿La IA sustituirá a mi equipo humano?",
    answer: "No. Lo libera de tareas repetitivas para que se enfoque en lo estratégico. La IA amplifica, no reemplaza."
  },
  {
    question: "¿Qué nivel técnico necesito para usar estos sistemas?",
    answer: "Ninguno. Entregamos todo listo para usar. Solo necesitas saber qué quieres mejorar."
  },
  {
    question: "¿La IA puede integrarse con mis herramientas actuales?",
    answer: "Sí. Trabajamos con CRMs, ERPs, Notion, Google Workspace, WhatsApp Business, entre otros. Adaptamos la IA a tu stack."
  },
  {
    question: "¿Cómo se entrena la IA con mis datos?",
    answer: "Creamos un sistema RAG (Retrieve-Augmented Generation) que indexa y protege tu información. La IA solo accede a lo que tú autorices."
  },
  {
    question: "¿Es seguro usar estos sistemas?",
    answer: "Sí. Cumplimos con buenas prácticas de seguridad y privacidad. Tus datos no se exponen ni se usan para entrenamientos externos."
  },
  {
    question: "¿Cómo sabré si estoy obteniendo resultados?",
    answer: "Medimos ahorro de tiempo, aumento de eficiencia y retorno económico en cada fase. Si no mejora tu negocio, no lo implementamos."
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
          
          <motion.h3
            className="mt-6 text-3xl font-bold tracking-tight"
            variants={sectionTitleVariants}
          >
            Resolvemos tus dudas
          </motion.h3>
          
          <motion.p
            className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
            variants={sectionTitleVariants}
          >
            Las respuestas a las preguntas más comunes sobre implementación de Inteligencia Artificial en empresas
          </motion.p>
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
            className="mx-auto max-w-4xl backdrop-blur-sm rounded-lg overflow-hidden border border-primary/10 shadow-lg"
          >
            {faqItems.map((item, index) => (
              <motion.div key={index} variants={accordionItemVariants}>
                <AccordionItem
                  value={`item-${index}`}
                  className="border-b border-primary/10 last:border-0"
                >
                  <AccordionTrigger
                    className="text-left text-lg font-medium hover:no-underline px-6 py-5 hover:bg-primary/5 transition-colors duration-200"
                    data-cursor-hover-target="true"
                  >
                    <TextAnimate
                      animation="fadeIn"
                      by="word"
                      once={true}
                      delay={0.05 * index}
                    >
                      {item.question}
                    </TextAnimate>
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground px-6 py-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="leading-relaxed"
                    >
                      {item.answer}
                    </motion.div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        {/* Call to action after FAQ */}
        <motion.div
          className="mt-12 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ amount: 0.3 }}
          variants={sectionTitleVariants}
        >
          <motion.p
            className="text-lg text-muted-foreground mb-6"
            variants={sectionTitleVariants}
          >
            ¿Tienes más preguntas? Estamos aquí para ayudarte
          </motion.p>
          
          <motion.div
            variants={sectionTitleVariants}
          >
            <button
              onClick={() => {
                const contactSection = document.getElementById('contact-form');
                if (contactSection) {
                  contactSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                  });
                }
              }}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              <span>Contactar con nosotros</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}