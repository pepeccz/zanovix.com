import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Shield, Eye, Cookie, UserCheck, Mail, Phone, MapPin, Calendar, Home, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Política de Privacidad - Zanovix AI',
  description: 'Política de privacidad de Zanovix AI. Información sobre cómo recopilamos, utilizamos y protegemos sus datos personales conforme al GDPR.',
  robots: 'index, follow',
};

export default function PoliticaPrivacidadPage() {
  return (
    <div className="min-h-screen bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Botón de volver al inicio */}
        <div className="mb-8">
          <Button asChild variant="outline" size="lg" className="group">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              <Home className="h-4 w-4" />
              <span>Volver al Inicio</span>
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">Política de Privacidad</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            En Zanovix AI respetamos su privacidad y nos comprometemos a proteger sus datos personales. 
            Esta política explica cómo recopilamos, utilizamos y protegemos su información.
          </p>
          <div className="mt-6 text-sm text-muted-foreground">
            <p><strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* 1. Información del Responsable */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                1. Responsable del Tratamiento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Datos de la Empresa</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Razón Social:</span>
                      <span>Pepe Cabeza Cruz</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">CIF:</span>
                      <span>77429548W</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <span>Málaga, España</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Contacto</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href="mailto:privacidad@zanovix.com" className="text-primary hover:underline">
                        privacidad@zanovix.com
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>+34 684 76 56 96</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Datos que Recopilamos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                2. Datos Personales que Recopilamos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">2.1. Datos de Contacto</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                    <li>Nombre y apellidos</li>
                    <li>Dirección de correo electrónico</li>
                    <li>Número de teléfono</li>
                    <li>Empresa u organización</li>
                    <li>Cargo o posición</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">2.2. Datos de Navegación</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                    <li>Dirección IP</li>
                    <li>Tipo de navegador y versión</li>
                    <li>Sistema operativo</li>
                    <li>Páginas visitadas y tiempo de permanencia</li>
                    <li>Fecha y hora de acceso</li>
                    <li>Sitio web de referencia</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">2.3. Datos de Comunicación</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                    <li>Contenido de formularios de contacto</li>
                    <li>Consultas y solicitudes de información</li>
                    <li>Preferencias de comunicación</li>
                    <li>Historial de interacciones</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Finalidades del Tratamiento */}
          <Card>
            <CardHeader>
              <CardTitle>3. Finalidades del Tratamiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">3.1. Gestión de Consultas</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                      <li>Responder a solicitudes de información</li>
                      <li>Proporcionar presupuestos</li>
                      <li>Programar reuniones y consultas</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold">3.2. Prestación de Servicios</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                      <li>Desarrollo de proyectos de IA</li>
                      <li>Consultoría especializada</li>
                      <li>Formación personalizada</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold">3.3. Marketing y Comunicación</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                      <li>Envío de newsletters (con consentimiento)</li>
                      <li>Información sobre nuevos servicios</li>
                      <li>Invitaciones a eventos</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold">3.4. Mejora del Sitio Web</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                      <li>Análisis de uso y navegación</li>
                      <li>Optimización de contenidos</li>
                      <li>Mejora de la experiencia de usuario</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Base Legal */}
          <Card>
            <CardHeader>
              <CardTitle>4. Base Legal del Tratamiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Consentimiento (Art. 6.1.a GDPR)</h4>
                    <p className="text-sm text-muted-foreground">
                      Para el envío de comunicaciones comerciales y newsletters, cuando usted nos otorga su consentimiento expreso.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Interés Legítimo (Art. 6.1.f GDPR)</h4>
                    <p className="text-sm text-muted-foreground">
                      Para responder a consultas, mejorar nuestros servicios y realizar análisis de navegación.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Ejecución de Contrato (Art. 6.1.b GDPR)</h4>
                    <p className="text-sm text-muted-foreground">
                      Para la prestación de servicios contratados y la gestión de la relación comercial.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 5. Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="h-5 w-5 text-primary" />
                5. Política de Cookies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Utilizamos cookies y tecnologías similares para mejorar su experiencia en nuestro sitio web.
                </p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2">5.1. Cookies Técnicas (Necesarias)</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Esenciales para el funcionamiento del sitio web. No requieren consentimiento.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                      <li>Cookies de sesión</li>
                      <li>Preferencias de tema (claro/oscuro)</li>
                      <li>Configuración de idioma</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">5.2. Cookies Analíticas</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Nos ayudan a entender cómo los usuarios interactúan con nuestro sitio.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                      <li>Google Analytics (anonimizadas)</li>
                      <li>Métricas de rendimiento</li>
                      <li>Análisis de comportamiento</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">5.3. Gestión de Cookies</h4>
                    <p className="text-sm text-muted-foreground">
                      Puede gestionar sus preferencias de cookies en cualquier momento a través de la configuración de su navegador 
                      o utilizando nuestro panel de configuración de cookies.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 6. Conservación de Datos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                6. Conservación de Datos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Datos de Contacto</h4>
                    <p className="text-sm text-muted-foreground">
                      Se conservan durante 3 años desde el último contacto, salvo que solicite su eliminación.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Datos de Navegación</h4>
                    <p className="text-sm text-muted-foreground">
                      Se conservan de forma anonimizada durante 26 meses para análisis estadísticos.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Datos Contractuales</h4>
                    <p className="text-sm text-muted-foreground">
                      Se conservan durante el tiempo necesario para cumplir obligaciones legales (mínimo 6 años).
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 7. Derechos del Usuario */}
          <Card>
            <CardHeader>
              <CardTitle>7. Sus Derechos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Conforme al GDPR, usted tiene los siguientes derechos sobre sus datos personales:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-semibold text-sm">Derecho de Acceso</h4>
                      <p className="text-xs text-muted-foreground">
                        Conocer qué datos tenemos sobre usted
                      </p>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-semibold text-sm">Derecho de Rectificación</h4>
                      <p className="text-xs text-muted-foreground">
                        Corregir datos inexactos o incompletos
                      </p>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-semibold text-sm">Derecho de Supresión</h4>
                      <p className="text-xs text-muted-foreground">
                        Solicitar la eliminación de sus datos
                      </p>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-semibold text-sm">Derecho de Limitación</h4>
                      <p className="text-xs text-muted-foreground">
                        Restringir el tratamiento de sus datos
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-semibold text-sm">Derecho de Portabilidad</h4>
                      <p className="text-xs text-muted-foreground">
                        Recibir sus datos en formato estructurado
                      </p>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-semibold text-sm">Derecho de Oposición</h4>
                      <p className="text-xs text-muted-foreground">
                        Oponerse al tratamiento de sus datos
                      </p>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-semibold text-sm">Retirada de Consentimiento</h4>
                      <p className="text-xs text-muted-foreground">
                        Retirar el consentimiento en cualquier momento
                      </p>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-semibold text-sm">Derecho de Reclamación</h4>
                      <p className="text-xs text-muted-foreground">
                        Presentar reclamación ante la AEPD
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                  <h4 className="font-semibold mb-2">¿Cómo ejercer sus derechos?</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Para ejercer cualquiera de estos derechos, puede contactarnos a través de:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                    <li>Email: <a href="mailto:privacidad@zanovix.com" className="text-primary hover:underline">privacidad@zanovix.com</a></li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-2">
                    <strong>Plazo de respuesta:</strong> Máximo 1 mes desde la recepción de su solicitud.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 8. Seguridad */}
          <Card>
            <CardHeader>
              <CardTitle>8. Medidas de Seguridad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Implementamos medidas técnicas y organizativas apropiadas para proteger sus datos personales:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Medidas Técnicas</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                      <li>Cifrado SSL/TLS en todas las comunicaciones</li>
                      <li>Servidores seguros con acceso restringido</li>
                      <li>Copias de seguridad regulares</li>
                      <li>Firewalls y sistemas de detección de intrusiones</li>
                      <li>Actualizaciones de seguridad regulares</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Medidas Organizativas</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                      <li>Acceso limitado solo a personal autorizado</li>
                      <li>Formación en protección de datos</li>
                      <li>Políticas internas de seguridad</li>
                      <li>Auditorías de seguridad periódicas</li>
                      <li>Procedimientos de respuesta a incidentes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 9. Transferencias Internacionales */}
          <Card>
            <CardHeader>
              <CardTitle>9. Transferencias Internacionales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Algunos de nuestros proveedores de servicios pueden estar ubicados fuera del Espacio Económico Europeo (EEE). 
                  En estos casos, garantizamos que:
                </p>
                
                <ul className="list-disc list-inside space-y-2 text-sm ml-4">
                  <li>Solo trabajamos con proveedores que ofrecen garantías adecuadas de protección</li>
                  <li>Utilizamos cláusulas contractuales tipo aprobadas por la Comisión Europea</li>
                  <li>Verificamos que el país de destino tenga una decisión de adecuación</li>
                  <li>Implementamos salvaguardas adicionales cuando es necesario</li>
                </ul>
                
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Principales Proveedores</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Google Analytics:</strong> Estados Unidos (Decisión de Adecuación)</p>
                    <p><strong>Servicios de hosting:</strong> Unión Europea</p>
                    <p><strong>Servicios de email:</strong> Unión Europea</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 10. Menores de Edad */}
          <Card>
            <CardHeader>
              <CardTitle>10. Menores de Edad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Nuestros servicios están dirigidos a empresas y profesionales. No recopilamos intencionalmente 
                  datos personales de menores de 16 años sin el consentimiento de sus padres o tutores legales.
                </p>
                
                <p className="text-sm text-muted-foreground">
                  Si tiene conocimiento de que un menor ha proporcionado datos personales, por favor contáctenos 
                  inmediatamente para que podamos tomar las medidas apropiadas.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 11. Cambios en la Política */}
          <Card>
            <CardHeader>
              <CardTitle>11. Cambios en esta Política</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Nos reservamos el derecho a modificar esta Política de Privacidad en cualquier momento. 
                  Los cambios entrarán en vigor inmediatamente después de su publicación en nuestro sitio web.
                </p>
                
                <p className="text-sm text-muted-foreground">
                  Le recomendamos revisar periódicamente esta política para mantenerse informado sobre 
                  cómo protegemos su información.
                </p>
                
                <div className="p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm">
                    <strong>Notificación de cambios importantes:</strong> En caso de cambios sustanciales, 
                    le notificaremos por email o mediante un aviso destacado en nuestro sitio web.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 12. Contacto */}
          <Card>
            <CardHeader>
              <CardTitle>12. Contacto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Si tiene alguna pregunta sobre esta Política de Privacidad o sobre el tratamiento de sus datos personales, 
                  puede contactarnos a través de:
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Datos de Contacto</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href="mailto:privacidad@zanovix.com" className="text-primary hover:underline">
                          privacidad@zanovix.com
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>+34 684 76 56 96</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <span>Málaga, España</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Autoridad de Control</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Agencia Española de Protección de Datos (AEPD)</strong></p>
                      <p>C/ Jorge Juan, 6</p>
                      <p>28001 Madrid</p>
                      <p>Tel: 912 663 517</p>
                      <p>
                        <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          www.aepd.es
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botón adicional para volver al inicio al final de la página */}
        <div className="mt-12 text-center">
          <Button asChild size="lg" className="group">
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              <span>Volver a la Página Principal</span>
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1 rotate-180" />
            </Link>
          </Button>
        </div>

        {/* Footer de la página */}
        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">
            Esta Política de Privacidad cumple con el Reglamento General de Protección de Datos (GDPR) 
            y la Ley Orgánica de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD).
          </p>
        </div>
      </div>
    </div>
  );
}