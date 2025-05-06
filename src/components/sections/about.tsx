
import Image from 'next/image';
import { Button } from '@/components/ui/button'; // Import Button
import Link from 'next/link'; // Import Link

export default function AboutSection() {
  return (
    <section id="about" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Main grid for layout */}
        <div className="grid grid-cols-1 items-center gap-x-12 md:grid-cols-2">
          {/* Title - visible on mobile, hidden on md and up (desktop will show it in the text column) */}
          <div className="md:hidden mb-8">
            <h2 className="glowing-border inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-primary hover:[animation-play-state:paused]">
              Sobre Nosotros
            </h2>
          </div>

          {/* Image Column - Order 1 on mobile, Order 1 on md and up */}
          <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg order-1">
            <Image
              src="/perfil.webp"
              alt="Pepe Cabeza, fundador de Zanovix AI"
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>

          {/* Text Content Column - Order 2 on mobile, Order 2 on md and up */}
          <div className="order-2 mt-8 md:mt-0">
            {/* Title - hidden on mobile, visible on md and up */}
            <h2 className="glowing-border mb-6 hidden md:inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-primary hover:[animation-play-state:paused]">
              Sobre Nosotros
            </h2>
            <p className="mb-6 text-lg text-muted-foreground">
             Soy Pepe Cabeza, fundador de Zanovix, y desde siempre he tenido una extraña obsesión: automatizar TODO lo que no me aportaba nada.
            </p>
            <p className="mb-4 text-lg text-muted-foreground">
             Todo empezó en el instituto. Mientras muchos hacían sus deberes a mano, yo prefería crear pequeños sistemas para que los hicieran por mí. No por flojo (bueno, un poco sí 😅), sino porque me fascinaba la idea de que una máquina pudiera liberarte tiempo para lo realmente importante.
            </p>
            <p className="text-lg text-muted-foreground mb-8">
             Esa mentalidad me llevó a estudiar programación, y más tarde, a enamorarme de la inteligencia artificial. Desde entonces, he ayudado a negocios locales, emprendedores y equipos de trabajo a recuperar el activo más importante que tenemos: el tiempo.
            </p>
            <Button asChild size="lg" className="w-full sm:w-auto sm:inline-flex">
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
