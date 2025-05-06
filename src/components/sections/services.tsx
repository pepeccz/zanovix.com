
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Code, ArrowRight } from 'lucide-react';

export default function ServicesSection() {
  return (
    <section id="services" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
           <h2 className="glowing-border inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-primary hover:[animation-play-state:paused]">
             Nuestros Servicios de IA
           </h2>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Link href="/formacion-consultoria" passHref legacyBehavior>
            <a className="block group"> {/* Added group class for potential group-hover styling if needed later */}
              <Card 
                className="flex flex-col overflow-hidden shadow-lg transition-all duration-300 ease-in-out group-hover:shadow-2xl group-hover:border-primary group-hover:scale-105 dark:border-border/50 h-full"
                data-cursor-hover-target="true"
              >
                <CardHeader className="bg-muted/50 p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Users className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl font-semibold">Formación y Consultoría IA</CardTitle>
                  <CardDescription className="mt-2 text-muted-foreground">
                    Capacitamos a tus equipos y te asesoramos para que integres la IA con éxito.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow p-6">
                  <p className="text-foreground/90">
                    Potencia las habilidades de tu personal con nuestros programas de formación personalizados. Te guiamos en la definición de estrategias de IA y en la implementación de las herramientas adecuadas para tus necesidades específicas, asegurando una adopción efectiva y sostenible.
                  </p>
                </CardContent>
                <CardFooter className="p-6 pt-0 mt-auto"> {/* Ensure footer is at the bottom */}
                  <Button variant="link" className="p-0 text-primary" tabIndex={-1}> {/* tabIndex -1 to prevent double tabbing as card is link */}
                    Saber más <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </a>
          </Link>

          <Link href="/desarrollo-soluciones" passHref legacyBehavior>
            <a className="block group"> {/* Added group class */}
              <Card 
                className="flex flex-col overflow-hidden shadow-lg transition-all duration-300 ease-in-out group-hover:shadow-2xl group-hover:border-primary group-hover:scale-105 dark:border-border/50 h-full"
                data-cursor-hover-target="true"
              >
                <CardHeader className="bg-muted/50 p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Code className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl font-semibold">Desarrollo de Soluciones IA</CardTitle>
                  <CardDescription className="mt-2 text-muted-foreground">
                    Creamos soluciones de inteligencia artificial a medida para tu negocio.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow p-6">
                  <p className="text-foreground/90">
                    Desde chatbots inteligentes y sistemas de recomendación hasta análisis predictivo y automatización de procesos. Desarrollamos e implementamos soluciones de IA robustas y escalables que generan un impacto real en tu eficiencia y resultados.
                  </p>
                </CardContent>
                <CardFooter className="p-6 pt-0 mt-auto"> {/* Ensure footer is at the bottom */}
                  <Button variant="link" className="p-0 text-primary" tabIndex={-1}> {/* tabIndex -1 */}
                    Saber más <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
}

