import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const PROTECTED_PATHS = [
  '/home', '/actors', '/projects', '/casting',
  '/mypage', '/settings', '/notifications',
  '/filmography', '/showreel', '/profile-edit', '/chat',
];

const LOGIN_ONLY_PATHS = ['/login', '/onboarding', '/splash'];

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isLoginPath = LOGIN_ONLY_PATHS.some((p) => pathname.startsWith(p));
  const isOnboardingPath = pathname.startsWith('/signup');
  const onboardingCompleted = (session?.user as any)?.onboardingCompleted;
  const roleType = (session?.user as any)?.roleType;

  // 비로그인 → 보호 경로 접근 시 로그인으로
  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  // 로그인됐지만 온보딩 미완료 → 보호 경로 접근 시 온보딩으로
  if (isProtected && session && !onboardingCompleted) {
    const onboardingPath = roleType === 'AGENCY' ? '/signup/agency' : '/signup/profile';
    return NextResponse.redirect(new URL(onboardingPath, nextUrl));
  }

  // 온보딩 완료 후 /signup/* 접근 시 홈으로
  if (isOnboardingPath && session && onboardingCompleted) {
    return NextResponse.redirect(new URL('/home', nextUrl));
  }

  // 로그인된 상태에서 /login 접근 시 홈으로
  if (isLoginPath && session) {
    return NextResponse.redirect(new URL('/home', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
};
