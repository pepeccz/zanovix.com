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
        <div className="flex flex-col items-center md:items-end space-y-2">
          <p className="text-sm text-muted-foreground text-center md:text-right">
            &copy; {currentYear} Zanovix. Todos los derechos reservados.
          </p>
          <Link 
            href="/politica-privacidad" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-gray-400 transition-colors duration-200 underline-offset-2 hover:underline"
            style={{ color: '#808080' }}
          >
            Política de Privacidad
          </Link>
        </div>
      </div>
    </footer>
  );
}