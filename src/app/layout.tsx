
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using Inter font for a modern look
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import MobileCTA from '@/components/layout/mobile-cta';
import PageTransition from '@/components/page-transition'; // Import the page transition component
import ScrollToTopButton from '@/components/scroll-to-top-button'; // Import the scroll to top button
import CursorFollower from '@/components/cursor-follower'; // Import the cursor follower

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Zanovix AI - Impulsa el futuro de tu negocio con IA',
  description: 'Ofrecemos soluciones de desarrollo de IA, consultoría y formación para potenciar tu empresa con inteligencia artificial real y efectiva.',
  keywords: ['inteligencia artificial', 'AI', 'desarrollo AI', 'consultoría AI', 'formación AI', 'Zanovix AI'],
  robots: 'index, follow',
  openGraph: {
    title: 'Zanovix AI - Impulsa el futuro de tu negocio con IA',
    description: 'Soluciones innovadoras de Inteligencia Artificial para empresas.',
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
    title: 'Zanovix AI - Impulsa el futuro de tu negocio con IA',
    description: 'Soluciones innovadoras de Inteligencia Artificial para empresas.',
    // images: ['https://www.zanovix.ai/twitter-image.png'], // Add actual image URL later
  },
  // Add sitemap link if generated separately
  // alternates: {
  //   canonical: 'https://www.zanovix.ai',
  // },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased flex flex-col min-h-screen`}> {/* Added flex classes */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          // disableTransitionOnChange // Removed to allow framer-motion to handle transitions
        >
          <Header />
           {/* Wrap the main content area with PageTransition */}
          <main className="flex-grow flex flex-col"> {/* Added flex flex-col */}
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
          <MobileCTA />
          <ScrollToTopButton /> {/* Add the scroll to top button */}
          <CursorFollower /> {/* Add the cursor follower */}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
