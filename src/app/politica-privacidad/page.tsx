"use client";

import { TextAnimate } from "@/components/ui/magic/text-animate";
import { Card, CardContent } from "@/components/ui/card";

export default function PoliticaPrivacidadPage() {
  return (
    <section className="py-16 min-h-[60vh] bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="shadow-lg">
          <CardContent className="py-10">
            <h1 className="text-4xl font-bold mb-6 text-center">
              <TextAnimate animation="blurInUp" by="word">
                Política de Privacidad
              </TextAnimate>
            </h1>
            <div className="prose prose-neutral max-w-none text-base">
              <h2>1. Responsable del tratamiento</h2>
              <p>
                Pepe Cabeza Cruz (en adelante, "Zanovix"), con correo de contacto <a href="mailto:info@zanovix.com">info@zanovix.com</a>, es responsable del tratamiento de los datos personales recogidos a través de este sitio web.
              </p>
              <h2>2. Datos personales que recopilamos</h2>
              <ul>
                <li>Nombre y apellidos</li>
                <li>Correo electrónico</li>
                <li>Teléfono</li>
                <li>Información facilitada en formularios de contacto o suscripción</li>
                <li>En el futuro, datos de navegación mediante Google Analytics</li>
              </ul>
              <h2>3. Finalidad del tratamiento</h2>
              <ul>
                <li>Gestionar solicitudes de contacto</li>
                <li>Envío de newsletters</li>
                <li>Prestación de servicios solicitados</li>
                <li>Mejorar la experiencia de usuario y analizar el uso del sitio web (Google Analytics, próximamente)</li>
              </ul>
              <h2>4. Legitimación</h2>
              <p>
                El tratamiento de los datos se basa en el consentimiento del usuario, la ejecución de un contrato o la aplicación de medidas precontractuales, y el interés legítimo de Zanovix para mejorar sus servicios.
              </p>
              <h2>5. Destinatarios</h2>
              <p>
                Zanovix no cede datos personales a terceros. Los datos podrán ser tratados por proveedores de servicios de almacenamiento en la nube y servidores propios, bajo acuerdos de confidencialidad y conforme a la normativa vigente.
              </p>
              <h2>6. Conservación de los datos</h2>
              <p>
                Los datos se conservarán durante el tiempo necesario para cumplir con la finalidad para la que se recabaron o hasta que el usuario solicite su supresión.
              </p>
              <h2>7. Derechos de los usuarios</h2>
              <p>
                El usuario puede ejercer los derechos de acceso, rectificación y eliminación de sus datos enviando una solicitud a <a href="mailto:info@zanovix.com">info@zanovix.com</a>.
              </p>
              <h2>8. Seguridad</h2>
              <p>
                Zanovix aplica medidas técnicas y organizativas para proteger los datos personales y evitar su alteración, pérdida, tratamiento o acceso no autorizado.
              </p>
              <h2>9. Cambios en la política de privacidad</h2>
              <p>
                Zanovix podrá modificar la presente política para adaptarla a novedades legislativas o jurisprudenciales. Se recomienda revisar periódicamente esta página.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
} 