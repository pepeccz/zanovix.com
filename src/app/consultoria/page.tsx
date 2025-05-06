
"use client"; // Add 'use client' directive

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ConsultoriaPage() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({"namespace":"consultoria-gratis"});
      cal("ui", {"hideEventTypeDetails":true,"layout":"month_view"});
    })();
  }, [])
  return <div className="container mx-auto min-h-[calc(100vh-10rem)] py-16 px-4 flex flex-col items-center text-center">
  <h1 className="text-4xl font-bold mb-4">Agenda tu Consultoría Gratuita</h1>
  <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
    Hablemos sobre cómo la inteligencia artificial puede transformar tu negocio. Reserva una sesión gratuita de 30 minutos para discutir tus necesidades y explorar posibles soluciones.
  </p>
   <div className="w-full max-w-4xl h-[650px] rounded-lg shadow-md overflow-hidden bg-card">
 <Cal namespace="consultoria-gratis"
    calLink="pepecabeza/consultoria-gratis"
    style={{width:"100%",height:"100%",overflow:"scroll"}}
    config={{"layout":"month_view"}}
  />
</div>
   {/* This Button will inherit data-cursor-hover-target="true" */}
   <Button variant="outline" className="mt-8" asChild>
     <Link href="/">Volver al Inicio</Link>
   </Button>
    </div>
}

