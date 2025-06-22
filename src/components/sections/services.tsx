"use client"; // Mark as client component for framer-motion

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MagicCard } from '@/components/ui/magic-card';
import { TextAnimate } from '@/components/ui/magic/text-animate';
import { AnimatedBeam } from '@/components/ui/magic/animated-beam';
import { 
  Phone, 
  ArrowRight, 
  Settings, 
  BarChart3, 
  MessageSquare, 
  Lightbulb, 
  Wrench, 
  Shield, 
  Code, 
  Users, 
  ShoppingCart, 
  Truck, 
  Bot,
  ChevronDown,
  Star
} from 'lucide-react';
import { useState } from 'react';

const sectionTitleVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", delay: 0.1 } },
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6, 
      ease: "easeOut",
      delay: 0.3
    } 
  },
};

const highlightVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { 
      duration: 0.5, 
      ease: "easeOut",
      delay: 0.6
    } 
  },
};

const warningVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5, 
      ease: "easeOut",
      delay: 0.8
    } 
  },
};

const cardsContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// Variantes optimizadas para las tarjetas individuales
const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.4, 
      ease: "easeOut"
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: { 
      duration: 0.3, 
      ease: "easeIn"
    },
  }
};

const buttonVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5, 
      ease: "easeOut",
      delay: 0.3
    } 
  },
};

interface ServiceCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  emoji: string;
  isFeatured?: boolean;
  index: number;
}

const ServiceCard = ({ icon: Icon, title, description, emoji, isFeatured = false, index }: ServiceCardProps) => (
  <motion.div 
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    layout
    layoutId={`service-card-${index}`}
    transition={{ layout: { duration: 0.3 } }}
  >
    <MagicCard className="h-full">
      <div className="p-6 flex flex-col h-full relative">
        {isFeatured && (
          <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 shadow-lg">
            <Star className="h-4 w-4 fill-current" />
          </div>
        )}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{emoji}</span>
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isFeatured ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <h3 className={`text-lg font-semibold mb-3 ${isFeatured ? 'text-primary' : 'text-foreground'}`}>
          {title}
          {isFeatured && <span className="text-xs ml-2 bg-primary/10 text-primary px-2 py-1 rounded-full">MÁS DEMANDADO</span>}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed flex-grow">{description}</p>
      </div>
    </MagicCard>
  </motion.div>
);

// Reorganizar servicios con "Atención al cliente" primero
const services = [
  {
    emoji: "💬",
    icon: MessageSquare,
    title: "Atención al cliente / Soporte",
    description: "Chatbots y asistentes virtuales (chat/texto/voz) ofrecen respuestas inmediatas, gestión de incidencias y escalado de casos complejos a agentes humanos.",
    isFeatured: true
  },
  {
    emoji: "⚙️",
    icon: Settings,
    title: "Automatización de procesos y servicios",
    description: "La IA permite automatizar tareas repetitivas como gestión de inventarios, facturación, atención al cliente básica, conciliación contable o generación de informes, reduciendo tiempos y errores."
  },
  {
    emoji: "📊",
    icon: BarChart3,
    title: "Análisis de datos y toma de decisiones",
    description: "Para tratar y extraer insights de grandes volúmenes de datos (estructurados o no), identificando patrones, tendencias de mercado o riesgos, y soportando decisiones estratégicas."
  },
  {
    emoji: "💡",
    icon: Lightbulb,
    title: "Recomendaciones y personalización",
    description: "Motores de recomendación para e-commerce, contenido, publicidad, ofertas personalizadas según gustos y comportamiento del usuario."
  },
  {
    emoji: "🔧",
    icon: Wrench,
    title: "Mantenimiento y detección predictiva de fallos",
    description: "En industrias con maquinaria o infraestructura, la IA predice fallos en equipos antes de que ocurran, optimizando costes y tiempo de actividad."
  },
  {
    emoji: "🛡️",
    icon: Shield,
    title: "Detección de fraudes y anomalías",
    description: "Muy usada en finanzas, banca, auditoría, para analizar patrones transaccionales, detectar fraudes, errores y salvaguardar sistemas financieros."
  },
  {
    emoji: "⚙️",
    icon: Code,
    title: "Generación de código y operaciones TI (AIOps)",
    description: "La IA generativa acelera la programación, moderniza código legacy, automatiza despliegues y ajusta optimizaciones en la nube."
  },
  {
    emoji: "🤝",
    icon: Users,
    title: "Recursos Humanos y reclutamiento",
    description: "Clasificación de currículos, screening de candidatos, entrevistas vía bots, anuncios de empleo segmentados, evitando sesgos operativos."
  },
  {
    emoji: "🛒",
    icon: ShoppingCart,
    title: "Publicidad y precios dinámicos",
    description: "Ajuste de precios en tiempo real según demanda y competencia, y optimización de campañas publicitarias online con IA para maximizar retorno."
  },
  {
    emoji: "🏭",
    icon: Truck,
    title: "Logística y distribución",
    description: "Optimización de la cadena de suministro: planificación, inventario, recogida automática con drones y robótica en almacenes."
  },
  {
    emoji: "🔄",
    icon: Bot,
    title: "Agentes autónomos (\"agentic AI\")",
    description: "IA que actúa de forma autónoma para completar tareas complejas, con supervisión humana, aún emergente y estratégico en sectores como finanzas, retail o salud."
  }
];

export default function ServicesSection() {
  const [visibleServices, setVisibleServices] = useState(3);
  const [isExpanding, setIsExpanding] = useState(false);

  const handleContactClick = () => {
    const contactSection = document.getElementById('contact-form');
    if (contactSection) {
      contactSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleShowMore = () => {
    setIsExpanding(true);
    // Reducir el delay para una transición más rápida
    setTimeout(() => {
      setVisibleServices(prev => Math.min(prev + 3, services.length));
      setIsExpanding(false);
    }, 150);
  };

  const handleShowLess = () => {
    setIsExpanding(true);
    setTimeout(() => {
      setVisibleServices(3);
      setIsExpanding(false);
    }, 150);
  };

  return (
    <section id="services" className="py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background">
        <AnimatedBeam className="opacity-20" numBeams={8} gradientStartColor="rgba(62, 167, 137, 0.3)" gradientStopColor="rgba(62, 167, 137, 0.1)" />
      </div>

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-primary/5 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ amount: 0.3 }}
          variants={sectionTitleVariants}
        >
          <h2 className="glowing-border inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-primary hover:[animation-play-state:paused]">
            Nuestros Servicios
          </h2>
          
          <div className="mt-8 space-y-8">
            <motion.div
              variants={contentVariants}
              className="text-lg md:text-xl text-foreground leading-relaxed"
            >
              <TextAnimate
                animation="fadeIn"
                by="word"
                className="block mb-6"
              >
                Ofrecemos todas las soluciones que engloba el mundo de la Inteligencia Artificial para empresas que quieren escalar.
              </TextAnimate>
            </motion.div>

            {/* Cuadro verde destacado */}
            <motion.div
              variants={highlightVariants}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-primary/10 to-green-500/10 rounded-xl blur-xl"></div>
              <div className="relative bg-gradient-to-r from-green-50 to-primary/5 dark:from-green-950/20 dark:to-primary/10 border border-green-200 dark:border-green-800 rounded-xl p-8">
                <div className="text-lg md:text-xl font-semibold text-green-800 dark:text-green-200 leading-relaxed">
                  <TextAnimate
                    animation="blurInUp"
                    by="word"
                    delay={0.1}
                    className="block"
                  >
                    Somos expertos en IA aplicada. Si tu negocio tiene un cuello de botella o pierde mucho tiempo en otros flujos de trabajo, podemos automatizarlo.
                  </TextAnimate>
                </div>
              </div>
            </motion.div>

            {/* Texto de advertencia sin cuadro */}
            <motion.div
              variants={warningVariants}
              className="text-lg md:text-xl text-foreground leading-relaxed"
            >
              <div className="mb-4">
                <TextAnimate
                  animation="fadeIn"
                  by="word"
                  delay={0.1}
                  className="inline"
                >
                  Pero si tu empresa aún no sabe lo que es un agente inteligente de inteligencia artificial,{" "}
                </TextAnimate>
                <span className="font-bold text-red-600 dark:text-red-400">NO NOS LLAMES</span>
              </div>
              
              <TextAnimate
                animation="fadeIn"
                by="word"
                delay={0.3}
                className="block text-muted-foreground"
              >
                Todavía no estás listo para trabajar con nosotros.
              </TextAnimate>
            </motion.div>
          </div>
        </motion.div>

        {/* Services Cards Section */}
        <motion.div
          className="mt-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ amount: 0.1 }}
          variants={cardsContainerVariants}
        >
          <motion.div
            variants={cardVariants}
            className="text-center mb-12"
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Servicios Destacados</h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Descubre las principales áreas donde la Inteligencia Artificial puede transformar tu negocio
            </p>
          </motion.div>

          {/* Grid con AnimatePresence para transiciones suaves */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            layout
          >
            <AnimatePresence mode="popLayout">
              {services.slice(0, visibleServices).map((service, index) => (
                <ServiceCard
                  key={`service-${index}`}
                  emoji={service.emoji}
                  icon={service.icon}
                  title={service.title}
                  description={service.description}
                  isFeatured={service.isFeatured}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Botón Ver más / Ver menos */}
          {services.length > 3 && (
            <motion.div
              className="flex justify-center mt-8"
              initial="hidden"
              animate="visible"
              variants={buttonVariants}
            >
              {visibleServices < services.length ? (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleShowMore}
                  disabled={isExpanding}
                  className="group"
                >
                  {isExpanding ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      <span>Cargando...</span>
                    </div>
                  ) : (
                    <>
                      <span>Ver más servicios</span>
                      <ChevronDown className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-y-1" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleShowLess}
                  disabled={isExpanding}
                  className="group"
                >
                  {isExpanding ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      <span>Cargando...</span>
                    </div>
                  ) : (
                    <>
                      <span>Ver menos</span>
                      <ChevronDown className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:-translate-y-1 rotate-180" />
                    </>
                  )}
                </Button>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Botón de contactar */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ amount: 0.3 }}
          variants={buttonVariants}
          className="flex justify-center pt-16"
        >
          <Button 
            size="lg" 
            className="group px-8 py-4 text-lg font-semibold"
            onClick={handleContactClick}
          >
            <Phone className="h-5 w-5 mr-2" />
            <span>Contactar</span>
            <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}