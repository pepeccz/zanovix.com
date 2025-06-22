"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { TextAnimate } from '@/components/ui/magic/text-animate';
import { AnimatedBeam } from '@/components/ui/magic/animated-beam';
import { Send, CheckCircle2, AlertCircle, Loader2, Shield, User, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

interface FormData {
  nombre: string;
  empresa: string;
  email: string;
  presupuesto: string;
  idea: string;
}

interface FormErrors {
  nombre?: string;
  empresa?: string;
  email?: string;
  presupuesto?: string;
  idea?: string;
}

const presupuestoOptions = [
  { value: "1000-3000", label: "1.000€ - 3.000€" },
  { value: "3000-5000", label: "3.000€ - 5.000€" },
  { value: "5000-10000", label: "5.000€ - 10.000€" },
  { value: "10000+", label: "+10.000€" },
];

export default function ContactFormSection() {
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    empresa: '',
    email: '',
    presupuesto: '',
    idea: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (!formData.empresa.trim()) {
      newErrors.empresa = 'La empresa es obligatoria';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.presupuesto) {
      newErrors.presupuesto = 'Selecciona un rango de presupuesto';
    }

    if (!formData.idea.trim()) {
      newErrors.idea = 'Cuéntanos sobre tu idea';
    } else if (formData.idea.trim().length < 10) {
      newErrors.idea = 'Describe tu idea con más detalle (mínimo 10 caracteres)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Error en el formulario",
        description: "Por favor, corrige los errores antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    const webhookUrl = process.env.NEXT_PUBLIC_CONTACT_FORM_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.error('Webhook URL not configured');
      toast({
        title: "Error de configuración",
        description: "La URL del webhook no está configurada. Contacta al administrador.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          empresa: formData.empresa,
          email: formData.email,
          presupuesto: formData.presupuesto,
          idea: formData.idea,
          timestamp: new Date().toISOString(),
          source: 'website-contact-form'
        }),
      });

      if (!response.ok) {
        throw new Error(`Error en webhook: ${response.status}`);
      }

      setIsSubmitted(true);
      toast({
        title: "¡Mensaje enviado!",
        description: "Gracias por contactarnos. Te responderemos pronto.",
      });

      // Resetear formulario después de 3 segundos
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          nombre: '',
          empresa: '',
          email: '',
          presupuesto: '',
          idea: '',
        });
      }, 3000);

    } catch (error) {
      console.error('Error al enviar formulario:', error);
      toast({
        title: "Error al enviar",
        description: "Hubo un problema al enviar tu mensaje. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background">
          <AnimatedBeam className="opacity-30" numBeams={15} gradientStartColor="rgba(62, 167, 137, 0.5)" gradientStopColor="rgba(62, 167, 137, 0.1)" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8">
              <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">¡Mensaje Enviado!</h2>
              <p className="text-lg text-muted-foreground">
                Gracias por contactarnos. Hemos recibido tu mensaje y te responderemos en las próximas 24 horas.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background with animated beam effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background">
        <AnimatedBeam className="opacity-30" numBeams={15} gradientStartColor="rgba(62, 167, 137, 0.5)" gradientStopColor="rgba(62, 167, 137, 0.1)" />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-primary/5 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ amount: 0.3 }}
          variants={containerVariants}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="glowing-border inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-primary hover:[animation-play-state:paused]">
              Contacto
            </h2>
            <div className="mt-4">
              <TextAnimate
                animation="blurInUp"
                by="word"
                className="text-4xl font-bold tracking-tight"
              >
                Cuéntanos sobre tu proyecto
              </TextAnimate>
            </div>
            <motion.p
              variants={itemVariants}
              className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Estamos aquí para ayudarte a transformar tu idea en realidad. Completa el formulario y nos pondremos en contacto contigo en menos de 24 horas.
            </motion.p>
          </motion.div>

          {/* Form */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-lg border-primary/10">
              {/* Modern Header with Icons */}
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 px-8 py-6 border-b border-primary/10">
                <h3 className="text-2xl font-bold text-center mb-4">Formulario de Contacto</h3>
                <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>Sin compromiso</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <span>Personalizada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>100% confidencial</span>
                  </div>
                </div>
              </div>

              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nombre */}
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre *</Label>
                      <Input
                        id="nombre"
                        type="text"
                        placeholder="Tu nombre completo"
                        value={formData.nombre}
                        onChange={(e) => handleInputChange('nombre', e.target.value)}
                        className={errors.nombre ? 'border-destructive' : ''}
                      />
                      {errors.nombre && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.nombre}
                        </p>
                      )}
                    </div>

                    {/* Empresa */}
                    <div className="space-y-2">
                      <Label htmlFor="empresa">Empresa *</Label>
                      <Input
                        id="empresa"
                        type="text"
                        placeholder="Nombre de tu empresa"
                        value={formData.empresa}
                        onChange={(e) => handleInputChange('empresa', e.target.value)}
                        className={errors.empresa ? 'border-destructive' : ''}
                      />
                      {errors.empresa && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.empresa}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={errors.email ? 'border-destructive' : ''}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Presupuesto */}
                    <div className="space-y-2">
                      <Label htmlFor="presupuesto">Presupuesto *</Label>
                      <Select
                        value={formData.presupuesto}
                        onValueChange={(value) => handleInputChange('presupuesto', value)}
                      >
                        <SelectTrigger className={errors.presupuesto ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Selecciona un rango" />
                        </SelectTrigger>
                        <SelectContent>
                          {presupuestoOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.presupuesto && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.presupuesto}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Idea */}
                  <div className="space-y-2">
                    <Label htmlFor="idea">Cuéntame más sobre tu idea *</Label>
                    <Textarea
                      id="idea"
                      placeholder="Describe tu proyecto, objetivos, necesidades específicas, plazos, etc. Cuanta más información nos proporciones, mejor podremos ayudarte."
                      rows={5}
                      value={formData.idea}
                      onChange={(e) => handleInputChange('idea', e.target.value)}
                      className={errors.idea ? 'border-destructive' : ''}
                    />
                    <div className="flex justify-between items-center">
                      {errors.idea ? (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.idea}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Mínimo 10 caracteres
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {formData.idea.length} caracteres
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full group"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Enviar mensaje
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground text-center">
                    * Campos obligatorios. Nos comprometemos a responder en menos de 24 horas.
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}