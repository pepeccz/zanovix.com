import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Log para depuración
  console.log(`Middleware: Navegación a ${request.nextUrl.pathname}`);
  
  // Continuar con la solicitud normal
  return NextResponse.next();
}

// Configurar el middleware para ejecutarse en todas las rutas
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};