"use client"; // Required because hover effects are client-side interactions

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { MagicCard } from '@/components/ui/magic-card';
import { TextAnimate } from '@/components/ui/magic/text-animate';
import { Sparkles } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  title: string;
  company: string;
  text: string;
  initials: string;
}

const testimonials: Testimonial[] = [
  { id: 1, name: "Ana García", title: "CEO", company: "Innovatech", text: "Zanovix AI revolucionó nuestra eficiencia operativa. Su equipo es experto y comprometido.", initials: "AG" },
  { id: 2, name: "Carlos Rodríguez", title: "Director de Marketing", company: "MarketBoost", text: "La formación en IA nos ha permitido crear campañas mucho más efectivas. ¡Totalmente recomendados!", initials: "CR" },
  { id: 3, name: "Laura Martínez", title: "CTO", company: "TechSolutions", text: "El desarrollo a medida superó nuestras expectativas. Zanovix entendió perfectamente nuestras necesidades.", initials: "LM" },
  { id: 4, name: "Javier López", title: "Gerente de Proyecto", company: "BuildCorp", text: "Su consultoría fue clave para definir nuestra estrategia de IA. Un socio invaluable.", initials: "JL" },
  { id: 5, name: "Sofía Fernández", title: "Analista de Datos", company: "Data Insights", text: "Aprendimos muchísimo en la formación. Ahora podemos aplicar IA en nuestros análisis diarios.", initials: "SF" },
  { id: 6, name: "David Pérez", title: "Fundador", company: "Startup X", text: "Implementaron un chatbot que mejoró nuestra atención al cliente drásticamente.", initials: "DP" },
  { id: 7, name: "Elena Gómez", title: "Directora Financiera", company: "FinancePro", text: "La automatización de procesos con IA nos ha ahorrado tiempo y reducido errores.", initials: "EG" },
  { id: 8, name: "Miguel Sánchez", title: "Jefe de Producto", company: "AppFactory", text: "Zanovix nos ayudó a integrar IA en nuestra app, mejorando la experiencia del usuario.", initials: "MS" },
];

const duplicatedTestimonials = [...testimonials, ...testimonials];

const sectionTitleVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", delay: 0.1 } },
};

const carouselContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7, ease: "easeOut", delay: 0.3 } },
};

const TestimonialCard = ({ testimonial, index }: { testimonial: Testimonial, index: number }) => {
  const y = useMotionValue(0);
  const x = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const centerX = rect.left + width / 2;
    const centerY = rect.top + height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Generar un color de fondo aleatorio pero consistente para cada avatar
  const getAvatarColor = (initials: string) => {
    // Usar las iniciales para generar un color consistente
    const charCode1 = initials.charCodeAt(0) || 65;
    const charCode2 = initials.charCodeAt(1) || 65;

    // Generar un color HSL con un tono basado en las iniciales
    // Usar un tono relacionado con el color primario (#3ea789 - un verde/turquesa)
    const hue = ((charCode1 * charCode2) % 60) + 140; // Rango de 140-200 (verdes/turquesas)
    const saturation = 70 + (charCode1 % 30); // 70-100%
    const lightness = 40 + (charCode2 % 20); // 40-60%

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  return (
    <motion.div
      className="w-80 flex-shrink-0 snap-center"
      style={{
        perspective: 1000,
        rotateX,
        rotateY,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
    >
      <MagicCard
        className="h-full cursor-pointer"
        gradientFrom="#3ea789"
        gradientTo="#3ea789"
        gradientOpacity={0.5}
      >
        <CardContent className="flex flex-col items-start p-6 pt-8 h-full">
          <div className="flex items-center w-full mb-4">
            <Avatar className="relative h-16 w-16 border-2 border-primary mr-4">
              <AvatarFallback style={{ backgroundColor: getAvatarColor(testimonial.initials) }}>
                {testimonial.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">{testimonial.name}</p>
              <p className="text-sm text-muted-foreground">
                {testimonial.title}, {testimonial.company}
              </p>
            </div>
          </div>
          <blockquote className="mb-4 text-foreground/90 italic relative">
            <span className="absolute -top-2 -left-2 text-primary opacity-30 text-4xl">"</span>
            <TextAnimate
              animation="fadeIn"
              by="word"
              delay={0.1}
              className="relative z-10"
            >
              {testimonial.text}
            </TextAnimate>
            <span className="absolute -bottom-4 -right-2 text-primary opacity-30 text-4xl">"</span>
          </blockquote>
        </CardContent>
      </MagicCard>
    </motion.div>
  );
};

export default function TestimonialsSection() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const animationFrameId = useRef<number | null>(null);
  const velocity = useRef(0);
  const lastTimestamp = useRef(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (sliderRef.current) {
      setIsDragging(true);
      setStartX(e.pageX - sliderRef.current.offsetLeft);
      setScrollLeft(sliderRef.current.scrollLeft);
      sliderRef.current.classList.remove('animate-scroll'); // Pause CSS animation
      sliderRef.current.classList.add('cursor-grabbing');
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      velocity.current = 0;
      lastTimestamp.current = performance.now();
    }
  };

  const handleMouseLeaveOrUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      if (sliderRef.current) {
        sliderRef.current.classList.add('animate-scroll'); // Resume CSS animation if preferred
        sliderRef.current.classList.remove('cursor-grabbing');

        // Inertia scrolling
        const decelerate = () => {
          if (Math.abs(velocity.current) > 0.1 && sliderRef.current) {
            sliderRef.current.scrollLeft += velocity.current;
            velocity.current *= 0.95; // Deceleration factor
            animationFrameId.current = requestAnimationFrame(decelerate);
          } else {
            velocity.current = 0;
          }
        };
        decelerate();
      }
    }
  }, [isDragging]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Adjust scroll speed multiplier

    const newScrollLeft = scrollLeft - walk;

    const now = performance.now();
    const deltaTime = now - lastTimestamp.current;
    if (deltaTime > 0) { // Avoid division by zero or negative time
        velocity.current = (sliderRef.current.scrollLeft - newScrollLeft) / deltaTime * 10; // Adjusted velocity calculation
    }
    lastTimestamp.current = now;

    sliderRef.current.scrollLeft = newScrollLeft;
  };

  useEffect(() => {
    // Attach mouseup to window to handle cases where mouse is released outside the slider
    window.addEventListener('mouseup', handleMouseLeaveOrUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseLeaveOrUp);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [handleMouseLeaveOrUp]);

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-muted/30 dark:bg-muted/10 overflow-hidden relative">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-primary/5 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="mb-12 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ amount: 0.3 }}
          variants={sectionTitleVariants}
        >
          <h2 className="glowing-border inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-primary hover:[animation-play-state:paused]">
            Lo que dicen nuestros clientes
          </h2>
          <h3 className="mt-4 text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
            Testimonios
            <Sparkles className="h-6 w-6 text-primary" />
          </h3>
        </motion.div>

        <motion.div
          className="relative w-full overflow-hidden group py-4 cursor-grab"
          initial="hidden"
          whileInView="visible"
          viewport={{ amount: 0.1 }}
          variants={carouselContainerVariants}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeaveOrUp}
          onMouseUp={handleMouseLeaveOrUp}
          onMouseMove={handleMouseMove}
          ref={sliderRef}
        >
          <div className="flex space-x-8 animate-scroll group-hover:[animation-play-state:paused]">
            {duplicatedTestimonials.map((testimonial, index) => (
              <TestimonialCard
                key={`${testimonial.id}-${index}`}
                testimonial={testimonial}
                index={index}
              />
            ))}
          </div>

          {/* Gradient overlays for smooth edges */}
          <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-muted/30 via-muted/30 to-transparent pointer-events-none z-10 dark:from-muted/10 dark:via-muted/10"></div>
          <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-muted/30 via-muted/30 to-transparent pointer-events-none z-10 dark:from-muted/10 dark:via-muted/10"></div>
        </motion.div>
      </div>
    </section>
  );
}
