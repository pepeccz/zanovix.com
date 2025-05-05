
// Placeholder page for /consultoria

import { Button } from "@/components/ui/button";
import Link from "next/link";
import CalEmbed from "@/components/cal-embed"; // Import the new component

export default function ConsultoriaPage() {
  return (
    <div className="container mx-auto min-h-[calc(100vh-10rem)] py-16 px-4 flex flex-col items-center text-center">
      <h1 className="text-4xl font-bold mb-4">Agenda tu Consultoría Gratuita</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
        Hablemos sobre cómo la inteligencia artificial puede transformar tu negocio. Reserva una sesión gratuita de 30 minutos para discutir tus necesidades y explorar posibles soluciones.
      </p>
       {/* Replace Calendly section with CalEmbed component */}
      <div className="w-full max-w-4xl h-[650px] rounded-lg shadow-md overflow-hidden bg-card">
        {/* Container for the embed, adjust height as needed */}
        <CalEmbed calLink="pepecabeza/consultoria-gratis" />
      </div>
       {/* This Button will inherit data-cursor-hover-target="true" */}
       <Button variant="outline" className="mt-8" asChild>
         <Link href="/">Volver al Inicio</Link>
       </Button>
    </div>
  );
}
