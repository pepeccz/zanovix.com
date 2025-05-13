# Plan de Desarrollo para Zanovix AI Website

## Visión General

Este documento detalla el plan completo para desarrollar el sitio web de Zanovix AI desde cero. El sitio es una plataforma moderna para una agencia de inteligencia artificial con sede en Málaga, que ofrece servicios de consultoría, desarrollo de soluciones a medida y formación en IA.

## Tecnologías y Frameworks

### Stack Principal
- **Next.js 15.x**: Framework React para desarrollo web de alto rendimiento con soporte para SSR y SSG
- **TypeScript**: Superset de JavaScript con tipado estático
- **Tailwind CSS**: Framework CSS utility-first para diseño rápido y flexible
- **Radix UI**: Componentes de interfaz de usuario accesibles y sin estilos predefinidos
- **Shadcn UI**: Componentes construidos sobre Radix UI con estilos personalizables
- **Framer Motion**: Biblioteca para animaciones fluidas y transiciones
- **Cal.com**: Integración para calendario de citas

### Dependencias Principales
- `@radix-ui/*`: Componentes UI primitivos
- `class-variance-authority`: Gestión de variantes de componentes
- `clsx` y `tailwind-merge`: Utilidades para combinar clases CSS
- `framer-motion`: Animaciones y transiciones
- `lucide-react`: Iconos
- `next-themes`: Soporte para temas claro/oscuro

## Estructura del Proyecto

```
src/
├── app/                    # Rutas y páginas (Next.js App Router)
│   ├── consultoria/        # Página de consultoría con Cal.com
│   ├── desarrollo-soluciones/ # Página de servicios de desarrollo
│   ├── formacion-consultoria/ # Página de formación y consultoría
│   ├── globals.css         # Estilos globales
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Página de inicio
│   └── ...                 # Otras páginas y configuraciones
├── components/             # Componentes reutilizables
│   ├── layout/             # Componentes de layout (header, footer, etc.)
│   ├── sections/           # Secciones principales de las páginas
│   ├── ui/                 # Componentes UI básicos
│   │   ├── magic/          # Componentes UI con efectos especiales
│   │   └── ...             # Otros componentes UI
│   └── ...                 # Otros componentes
├── hooks/                  # Custom hooks
├── lib/                    # Utilidades y funciones auxiliares
└── ...                     # Otros archivos y directorios
```

## Diseño y Estilo

### Tema y Paleta de Colores
- **Tema Principal**: Moderno, profesional, con enfoque en tecnología IA
- **Colores Primarios**: 
  - Verde/Turquesa (#3ea789) como color principal
  - Blanco/Negro para fondos (según tema claro/oscuro)
- **Tipografía**: Inter (Google Fonts)
- **Modo Oscuro**: Implementado con next-themes

### Componentes UI Personalizados
- **Magic Card**: Tarjetas con efectos de hover y gradientes
- **Animated Beam**: Efectos de haz animado para fondos
- **Text Animate**: Animaciones de texto (fadeIn, blurInUp, etc.)
- **Retro Grid**: Fondos con rejilla retro animada
- **Shimmer Button**: Botones con efecto de brillo
- **Pointer**: Seguidor de cursor personalizado

## Páginas Principales

### 1. Página de Inicio (Home)
- **Secciones**:
  - Hero con animaciones y CTA principal
  - Servicios destacados
  - Testimonios de clientes
  - Sobre nosotros
  - FAQ
  - CTA final

### 2. Desarrollo de Soluciones
- **Secciones**:
  - Hero con descripción del servicio
  - Tipos de soluciones que desarrollamos
  - Proceso de desarrollo
  - CTA para agendar consultoría

### 3. Formación y Consultoría
- **Secciones**:
  - Hero con descripción del servicio
  - Programas de formación a medida
  - Servicios de consultoría estratégica
  - CTA para agendar consultoría

### 4. Consultoría (Agenda)
- **Secciones**:
  - Hero con descripción del servicio
  - Beneficios de la consultoría
  - Integración de Cal.com para agendar citas

## Características Especiales

### Animaciones y Efectos
- Transiciones de página suaves
- Animaciones de scroll
- Efectos de hover en tarjetas y botones
- Animaciones de texto
- Seguidor de cursor personalizado
- Barra de progreso de scroll

### Componentes Interactivos
- Acordeón para FAQ
- Carrusel de testimonios
- Botón flotante para volver arriba
- CTA móvil que aparece al hacer scroll

### Optimización y Rendimiento
- Carga diferida de componentes no críticos
- Optimización de imágenes
- Minificación de CSS en producción
- Purga de CSS no utilizado

### SEO
- Metadatos optimizados
- Sitemap.xml generado automáticamente
- Robots.txt configurado
- Estructura semántica

## Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Consideraciones Móviles
- Menú adaptado para móviles
- CTA flotante en la parte inferior en móviles
- Layouts ajustados para pantallas pequeñas
- Optimización de rendimiento para dispositivos móviles

## Accesibilidad

- Contraste adecuado entre texto y fondo
- Etiquetas ARIA para componentes interactivos
- Navegación por teclado
- Soporte para lectores de pantalla
- Reducción de movimiento para usuarios que lo prefieran

## Integración de Terceros

- **Cal.com**: Para agendar consultas
- **Google Fonts**: Para la tipografía Inter
- **Google Analytics**: Para análisis de tráfico (a implementar)

## Despliegue

- **Entorno de Desarrollo**: Localhost con Next.js dev server
- **Entorno de Producción**: Vercel o similar
- **Contenedorización**: Docker disponible para despliegue alternativo
- **CI/CD**: Configuración para despliegue automático desde GitHub

## Mantenimiento y Escalabilidad

- Estructura modular para facilitar la adición de nuevas páginas
- Componentes reutilizables para mantener la consistencia
- Documentación de componentes y utilidades
- Tipado estricto con TypeScript para prevenir errores
