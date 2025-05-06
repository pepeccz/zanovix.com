
// Placeholder page for /formacion-consultoria

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FormacionConsultoriaPage() {
  return (
    <div className="container mx-auto min-h-[calc(100vh-10rem)] py-16 px-4">
      <h1 className="text-4xl font-bold mb-6">Formación y Consultoría IA</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
        Impulsamos el conocimiento y la estrategia de IA dentro de tu organización. Nuestros servicios de formación y consultoría están diseñados para capacitar a tus equipos y alinear la inteligencia artificial con tus objetivos de negocio.
      </p>

      <div className="space-y-12">
        {/* Section 1: Formación */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Programas de Formación a Medida</h2>
          <p className="mb-4 text-foreground/90">
            Ofrecemos workshops interactivos y programas de formación continuada adaptados a las necesidades específicas de tus equipos, desde niveles introductorios hasta avanzados en áreas como:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-4 text-foreground/90">
            <li>Fundamentos de Inteligencia Artificial y Machine Learning.</li>
            <li>Aplicaciones prácticas de IA en tu sector.</li>
            <li>Herramientas y plataformas de IA (e.g., Python, TensorFlow, PyTorch, APIs de OpenAI/Google).</li>
            <li>Ética y responsabilidad en IA.</li>
            <li>Gestión de proyectos de IA.</li>
          </ul>
           {/* This Button will inherit data-cursor-hover-target="true" */}
          <Button variant="link" className="p-0 text-primary hidden sm:inline-flex" asChild>
            <Link href="/consultoria">
              Solicitar información sobre formación <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Section 2: Consultoría */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Consultoría Estratégica de IA</h2>
          <p className="mb-4 text-foreground/90">
            Te ayudamos a navegar el complejo panorama de la IA y a tomar decisiones informadas:
          </p>
           <ul className="list-disc list-inside space-y-2 mb-4 text-foreground/90">
            <li>Evaluación de oportunidades de IA en tu negocio.</li>
            <li>Definición de hojas de ruta y estrategias de implementación.</li>
            <li>Selección de tecnologías y proveedores adecuados.</li>
            <li>Diseño de arquitecturas de datos para IA.</li>
            <li>Asesoramiento en la creación de equipos de IA internos.</li>
            <li>Auditoría y optimización de modelos existentes.</li>
          </ul>
           {/* This Button will inherit data-cursor-hover-target="true" */}
           <Button variant="link" className="p-0 text-primary hidden sm:inline-flex" asChild>
            <Link href="/consultoria">
              Agendar consultoría estratégica <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* This Button will inherit data-cursor-hover-target="true" */}
       <Button variant="outline" className="mt-12" asChild>
         <Link href="/">Volver al Inicio</Link>
       </Button>
    </div>
  );
}

