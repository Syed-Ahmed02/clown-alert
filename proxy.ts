import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/(.*)', // All API routes are public (they handle their own auth)
]);

const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)']);
const isDashboardRoute = createRouteMatcher(['/dashboard(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Allow public routes (homepage, sign-in, sign-up, API routes)
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // For any route that's not public, require authentication
  // Redirect unauthenticated users to sign-in
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // At this point, user is authenticated
  // Only check onboarding status for dashboard and onboarding routes
  const needsOnboardingCheck = isDashboardRoute(req) || isOnboardingRoute(req);
  
  if (!needsOnboardingCheck) {
    return NextResponse.next();
  }

  // For authenticated users on dashboard/onboarding, check onboarding status
  const checkUrl = new URL('/api/user/onboarded', req.url);
  
  try {
    const response = await fetch(checkUrl, {
      headers: {
        cookie: req.headers.get('cookie') || '',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      const isOnboarded = data.onboarded;

      // If user is not onboarded and trying to access dashboard, redirect to onboarding
      if (!isOnboarded && isDashboardRoute(req)) {
        return NextResponse.redirect(new URL('/onboarding', req.url));
      }

      // If user is already onboarded and trying to access onboarding, redirect to dashboard
      if (isOnboarded && isOnboardingRoute(req)) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
  } catch {
    // If API check fails, allow request to proceed
    // The page itself will handle the redirect
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

