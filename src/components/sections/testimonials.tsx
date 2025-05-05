import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Testimonial {
  id: number;
  name: string;
  title: string;
  company: string;
  text: string;
  avatar?: string; // Optional avatar image URL
}

// Placeholder testimonials - replace with real ones
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

// Duplicate testimonials for seamless scrolling effect
const duplicatedTestimonials = [...testimonials, ...testimonials];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-16 md:py-24 bg-muted/30 dark:bg-muted/10 overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Lo que dicen nuestros clientes
        </h2>
        <div className="relative w-full overflow-hidden">
          <div className="group flex space-x-8 animate-scroll hover:pause">
            {duplicatedTestimonials.map((testimonial, index) => (
              <Card
                key={`${testimonial.id}-${index}`}
                className="w-80 flex-shrink-0 snap-center transition-transform duration-300 ease-in-out group-hover:scale-[0.98] hover:!scale-100 bg-card shadow-lg"
              >
                <CardContent className="flex flex-col items-start p-6 pt-8">
                  <Avatar className="mb-4 h-16 w-16 border-2 border-primary">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint="person portrait" />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
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
           {/* Add fade effect at the edges */}
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-muted/30 dark:from-muted/10 to-transparent pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-muted/30 dark:from-muted/10 to-transparent pointer-events-none"></div>
        </div>
      </div>
      <style jsx>{`
        .animate-scroll {
          animation: scroll 60s linear infinite; /* Adjust duration as needed */
        }
        .group:hover .animate-scroll {
          animation-play-state: paused;
        }
         @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100% - ${testimonials.length * 2}rem)); } /* 2rem = space-x-8 / 4 */
        }
        /* Ensure hover pause works correctly */
        .hover\\:pause:hover {
          animation-play-state: paused;
        }

      `}</style>
    </section>
  );
}
