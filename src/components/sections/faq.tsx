import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "¿Qué tipo de empresas pueden beneficiarse de los servicios de Zanovix AI?",
    answer: "Prácticamente cualquier empresa que busque optimizar procesos, mejorar la toma de decisiones, personalizar la experiencia del cliente o innovar en sus productos/servicios puede beneficiarse. Trabajamos con startups, PYMES y grandes corporaciones en diversos sectores."
  },
  {
    question: "No tengo conocimientos técnicos sobre IA, ¿pueden ayudarme?",
    answer: "¡Absolutamente! Parte de nuestro trabajo es traducir la complejidad de la IA en soluciones prácticas y comprensibles. Ofrecemos consultoría y formación adaptada a todos los niveles de conocimiento técnico."
  },
  {
    question: "¿Cuánto tiempo se tarda en implementar una solución de IA?",
    answer: "El tiempo varía mucho según la complejidad del proyecto. Un proyecto piloto o una consultoría puntual puede llevar semanas, mientras que el desarrollo completo de una solución compleja puede extenderse varios meses. Siempre trabajamos con cronogramas claros y realistas."
  },
  {
    question: "¿Cuál es el coste de vuestros servicios?",
    answer: "Nuestros precios se adaptan a la medida y alcance de cada proyecto. Ofrecemos una consultoría gratuita inicial para entender tus necesidades y proporcionarte una propuesta detallada y transparente. Contáctanos para discutir tu caso específico."
  },
  {
    question: "¿Ofrecéis soporte después de la implementación?",
    answer: "Sí, ofrecemos planes de soporte y mantenimiento para asegurar el correcto funcionamiento y la evolución de las soluciones implementadas. Nuestro objetivo es construir relaciones a largo plazo con nuestros clientes."
  },
];

export default function FaqSection() {
  return (
    <section id="faq" className="py-16 md:py-24 bg-muted/30 dark:bg-muted/10">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
           <h2 className="glowing-border inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-primary hover:[animation-play-state:paused]">
             Preguntas Frecuentes
           </h2>
        </div>
        <Accordion type="single" collapsible className="mx-auto max-w-3xl">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-lg font-medium hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
