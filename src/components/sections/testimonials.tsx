"use client"; // Required because hover effects are client-side interactions

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface Testimonial {
  id: number;
  name: string;
  title: string;
  company: string;
  text: string;
  avatar?: string;
}

const testimonials: Testimonial[] = [
  { id: 1, name: "Ana García", title: "CEO", company: "Innovatech", text: "Zanovix AI revolucionó nuestra eficiencia operativa. Su equipo es experto y comprometido.", avatar: "https://picsum.photos/id/1011/100/100" },
  { id: 2, name: "Carlos Rodríguez", title: "Director de Marketing", company: "MarketBoost", text: "La formación en IA nos ha permitido crear campañas mucho más efectivas. ¡Totalmente recomendados!", avatar: "https://picsum.photos/id/1012/100/100" },
  { id: 3, name: "Laura Martínez", title: "CTO", company: "TechSolutions", text: "El desarrollo a medida superó nuestras expectativas. Zanovix entendió perfectamente nuestras necesidades.", avatar: "https://picsum.photos/id/1013/100/100" },
  { id: 4, name: "Javier López", title: "Gerente de Proyecto", company: "BuildCorp", text: "Su consultoría fue clave para definir nuestra estrategia de IA. Un socio invaluable.", avatar: "https://picsum.photos/id/1015/100/100" },
  { id: 5, name: "Sofía Fernández", title: "Analista de Datos", company: "Data Insights", text: "Aprendimos muchísimo en la formación. Ahora podemos aplicar IA en nuestros análisis diarios.", avatar: "https://picsum.photos/id/1025/100/100" },
  { id: 6, name: "David Pérez", title: "Fundador", company: "Startup X", text: "Implementaron un chatbot que mejoró nuestra atención al cliente drásticamente.", avatar: "https://picsum.photos/id/1027/100/100" },
  { id: 7, name: "Elena Gómez", title: "Directora Financiera", company: "FinancePro", text: "La automatización de procesos con IA nos ha ahorrado tiempo y reducido errores.", avatar: "https://picsum.photos/id/1028/100/100" },
  { id: 8, name: "Miguel Sánchez", title: "Jefe de Producto", company: "AppFactory", text: "Zanovix nos ayudó a integrar IA en nuestra app, mejorando la experiencia del usuario.", avatar: "https://picsum.photos/id/1031/100/100" },
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
    <section id="testimonials" className="py-16 md:py-24 bg-muted/30 dark:bg-muted/10 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          className="mb-12 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ amount: 0.3 }} // Removed once: true
          variants={sectionTitleVariants}
        >
           <h2 className="glowing-border inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-primary hover:[animation-play-state:paused]">
             Lo que dicen nuestros clientes
           </h2>
        </motion.div>
        <motion.div
          className="relative w-full overflow-hidden group py-4 cursor-grab"
          initial="hidden"
          whileInView="visible"
          viewport={{ amount: 0.1 }} // Removed once: true
          variants={carouselContainerVariants}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeaveOrUp} 
          onMouseUp={handleMouseLeaveOrUp}   
          onMouseMove={handleMouseMove}
          ref={sliderRef}
        >
          <div className="flex space-x-8 animate-scroll group-hover:[animation-play-state:paused]">
            {duplicatedTestimonials.map((testimonial, index) => (
              <Card
                key={`${testimonial.id}-${index}`}
                className="w-80 flex-shrink-0 snap-center transition-all duration-300 ease-in-out bg-card shadow-lg hover:shadow-2xl hover:border-primary hover:scale-105"
                data-cursor-hover-target="true"
              >
                <CardContent className="flex flex-col items-start p-6 pt-8">
                  <Avatar className="relative mb-4 h-16 w-16 border-2 border-primary">
                    {testimonial.avatar ? (
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        fill
                        sizes="64px"
                        className="rounded-full object-cover"
                        data-ai-hint="person portrait"
                      />
                    ) : (
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    )}
                  </Avatar>
                  <blockquote className="mb-4 text-foreground/90 italic">
                    "{testimonial.text}"
                  </blockquote>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.title}, {testimonial.company}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-muted/30 via-muted/30 to-transparent pointer-events-none z-10 dark:from-muted/10 dark:via-muted/10"></div>
          <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-muted/30 via-muted/30 to-transparent pointer-events-none z-10 dark:from-muted/10 dark:via-muted/10"></div>
        </motion.div>
      </div>
    </section>
  );
}
