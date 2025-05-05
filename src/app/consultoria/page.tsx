// Placeholder page for /consultoria
// You can replace this with a contact form, Calendly embed, etc.

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ConsultoriaPage() {
  return (
    <div className="container mx-auto min-h-[calc(100vh-10rem)] py-16 px-4 flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold mb-4">Agenda tu Consultoría Gratuita</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
        Hablemos sobre cómo la inteligencia artificial puede transformar tu negocio. Reserva una sesión gratuita de 30 minutos para discutir tus necesidades y explorar posibles soluciones.
      </p>
       {/* Example: Replace with Calendly embed or contact form */}
      <div className="bg-muted p-8 rounded-lg shadow-md w-full max-w-md">
        <p className="mb-4">Utiliza el siguiente enlace para encontrar un horario que te funcione:</p>
         <Button size="lg" asChild>
          <a href="https://calendly.com/your-link" target="_blank" rel="noopener noreferrer">
            Reservar Sesión en Calendly
          </a>
        </Button>
        <p className="text-sm text-muted-foreground mt-4"> (Serás redirigido a Calendly)</p>
      </div>
       <Button variant="outline" className="mt-8" asChild>
         <Link href="/">Volver al Inicio</Link>
       </Button>
    </div>
  );
}
