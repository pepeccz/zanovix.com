import Link from 'next/link';
import { Logo } from '@/components/logo'; // Placeholder for Logo component

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background py-8">
      <div className="container mx-auto flex flex-col items-center justify-between px-4 md:flex-row md:px-6">
        <Link href="/" aria-label="Zanovix AI Home">
          <Logo className="h-8 w-auto text-foreground mb-4 md:mb-0" />
        </Link>
        <p className="text-sm text-muted-foreground">
          &copy; {currentYear} Zanovix AI. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
