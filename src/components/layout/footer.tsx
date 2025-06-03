import Link from 'next/link';
import { Logo } from '@/components/logo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background py-8">
      <div className="container mx-auto flex flex-col items-center justify-between px-4 md:flex-row md:px-6">
        <Link href="/" aria-label="Zanovix AI Home" className="block h-8 w-auto">
           {/* Adjusted className for size control */}
          <Logo className="h-full w-auto mb-4 md:mb-0" />
        </Link>
        <p className="text-sm text-muted-foreground">
          &copy; {currentYear} Zanovix AI. Todos los derechos reservados.
          <span className="mx-2">|</span>
          <Link href="/politica-privacidad" className="underline hover:text-primary transition-colors">Política de Privacidad</Link>
        </p>
      </div>
    </footer>
  );
}
