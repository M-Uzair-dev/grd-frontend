import { NextResponse } from 'next/server';

// List of public routes that don't require authentication
const publicRoutes = ['/', '/signup'];

// List of routes that require admin authentication
const adminRoutes = ['/admin'];

// List of routes that require partner authentication
const partnerRoutes = ['/partner'];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip middleware for api routes and static files
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') ||
    pathname.includes('favicon.ico')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;
  const userRole = request.cookies.get('userRole')?.value;

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(route => pathname === route);

  // If user is not authenticated and trying to access protected routes
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is authenticated and trying to access public routes (login/signup)
  if (token && isPublicRoute) {
    return NextResponse.redirect(
      new URL(
        userRole === 'admin' ? '/admin/dashboard' : '/partner/dashboard',
        request.url
      )
    );
  }

  // If user is authenticated but trying to access wrong role's routes
  if (token && userRole) {
    if (userRole === 'partner' && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/partner/dashboard', request.url));
    }
    if (userRole === 'admin' && pathname.startsWith('/partner')) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 