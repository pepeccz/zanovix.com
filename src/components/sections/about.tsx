import Image from 'next/image';
import { Button } from '@/components/ui/button'; // Import Button
import Link from 'next/link'; // Import Link

export default function AboutSection() {
  return (
    <section id="about" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg">
            {/* Use the actual image */}
            <Image
              src="/perfil.webp" // Updated image path
              alt="Pepe Cabeza, fundador de Zanovix AI" // Updated alt text
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
              // Removed sizes prop, fill should handle responsiveness
            />
          </div>
          <div>
             <h2 className="glowing-border mb-6 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-primary hover:[animation-play-state:paused]">
               Sobre Nosotros
             </h2>
            <p className="mb-6 text-lg text-muted-foreground">
             Soy Pepe Cabeza, fundador de Zanovix, y desde siempre he tenido una extraña obsesión: automatizar TODO lo que no me aportaba nada.
            </p>
            <p className="mb-4 text-lg text-muted-foreground">
             Todo empezó en el instituto. Mientras muchos hacían sus deberes a mano, yo prefería crear pequeños sistemas para que los hicieran por mí. No por flojo (bueno, un poco sí 😅), sino porque me fascinaba la idea de que una máquina pudiera liberarte tiempo para lo realmente importante.
            </p>
            <p className="text-lg text-muted-foreground mb-8"> {/* Added margin bottom */}
             Esa mentalidad me llevó a estudiar programación, y más tarde, a enamorarme de la inteligencia artificial. Desde entonces, he ayudado a negocios locales, emprendedores y equipos de trabajo a recuperar el activo más importante que tenemos: el tiempo.
            </p>
            {/* Add the button */}
            <Button asChild size="lg">
              <Link href="/consultoria">
                Agendar consultoría gratis con Pepe Cabeza
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
