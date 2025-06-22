import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using Inter font for a modern look
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import MobileCTA from '@/components/layout/mobile-cta';
import PageTransition from '@/components/page-transition'; // Import the page transition component
import ScrollToTopButton from '@/components/scroll-to-top-button'; // Import the scroll to top button
import ScrollProgressBar from '@/components/scroll-progress-bar'; // Import the scroll progress bar
import StaticThemeButton from '@/components/static-theme-button'; // Import the static theme button
import Footer from '@/components/layout/footer'; // Import the footer component
import { LazyLoadedCursorFollower } from '@/components/client-components'; // Import from client components

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const newKeywords = [
  'agencia de inteligencia artificial en malaga',
  'agencia de inteligencia artificial en mijas',
  'agencia de inteligencia artificial en granada',
  'agencia de inteligencia artificial en madrid',
  'agencia de inteligencia artificial en barcelona',
  'agencia de inteligencia artificial en santander',
  'agencia de inteligencia artificial en marbella',
  'agencia de inteligencia artificial en coin',
  'agencia de inteligencia artificial en estepona',
  'agencia de inteligencia artificial en cadiz',
  'agencia de inteligencia artificial en sevilla',
  'agencia de inteligencia artificial en murcia',
  'formaciones personalizadas de inteligencia artificial para empresas',
  'inteligencia artificial',
  'AI',
  'desarrollo AI',
  'consultoría AI',
  'formación AI',
  'Zanovix AI',
  'soluciones IA',
  'transformación digital',
  'IA para empresas',
  'automatización con IA',
  'chatbots IA',
  'machine learning',
  'deep learning',
];

const newDescription = 'Zanovix AI, tu agencia de inteligencia artificial en Málaga. Ofrecemos soluciones de IA a medida, consultoría experta y formaciones personalizadas de inteligencia artificial para empresas en Mijas, Granada, Marbella, Madrid, Barcelona y toda España. Potenciamos tu negocio con IA real y efectiva.';

export const metadata: Metadata = {
  title: 'Zanovix AI - Agencia de inteligencia artificial en Málaga | Soluciones y Formación',
  description: newDescription,
  keywords: newKeywords,
  robots: 'index, follow',
  openGraph: {
    title: 'Zanovix AI - Agencia de inteligencia artificial en Málaga | Soluciones y Formación',
    description: newDescription,
    url: 'https://www.zanovix.ai', // Replace with actual domain
    siteName: 'Zanovix AI',
    // images: [ // Add actual image URL later
    //   {
    //     url: 'https://www.zanovix.ai/og-image.png',
    //     width: 1200,
    //     height: 630,
    //   },
    // ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zanovix AI - Agencia de inteligencia artificial en Málaga | Soluciones y Formación',
    description: newDescription,
    // images: ['https://www.zanovix.ai/twitter-image.png'], // Add actual image URL later
  },
  // Add sitemap link if generated separately
  // alternates: {
  //   canonical: 'https://www.zanovix.ai',
  // },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark" // Establecer el tema oscuro como predeterminado
          enableSystem={false} // Mantener deshabilitado el tema del sistema para evitar problemas de hidratación
          disableTransitionOnChange
        >
          <div id="page-content" className="relative flex min-h-screen flex-col">
            <PageTransition>
              <main className="flex-1">
                {children}
              </main>
            </PageTransition>
            <Footer />
            <MobileCTA />
            <StaticThemeButton />
            <ScrollToTopButton />
            <ScrollProgressBar />
            <LazyLoadedCursorFollower />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}