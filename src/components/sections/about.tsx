import Image from 'next/image';

export default function AboutSection() {
  return (
    <section id="about" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg">
            {/* Placeholder Image - Replace with actual image */}
            <Image
              src="https://picsum.photos/seed/zanovix-about/600/600"
              alt="Sobre Zanovix AI"
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
              data-ai-hint="person working computer technology"
            />
          </div>
          <div>
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Sobre Nosotros
            </h2>
            <p className="mb-6 text-lg text-muted-foreground">
             Soy [Tu Nombre], fundador de Zanovix AI. Mi pasión es desmitificar la inteligencia artificial y hacerla accesible y útil para empresas como la tuya. Con experiencia en [menciona tu campo principal, ej., desarrollo de software, análisis de datos] y un profundo conocimiento de las últimas tecnologías de IA, mi objetivo es ser tu socio estratégico en este viaje transformador.
            </p>
            <p className="text-lg text-muted-foreground">
             Creemos en una IA práctica, ética y centrada en resultados tangibles. Ya sea que necesites desarrollar una solución compleja, formar a tu equipo o definir tu hoja de ruta de IA, estamos aquí para ayudarte a navegar el futuro con confianza y convertir el potencial de la inteligencia artificial en una ventaja competitiva real para tu negocio.
            </p>
            {/* Optional: Add a button or link */}
            {/* <Button className="mt-6">Conócenos mejor</Button> */}
          </div>
        </div>
      </div>
    </section>
  );
}
