import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// ─── Error response factory ───────────────────────────────────────────────────
// Centralises all HTTP error shapes so every route returns consistent bodies.

export const apiError = {
  unauthorized: () =>
    NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),

  forbidden: (message = '권한이 없습니다.') =>
    NextResponse.json({ error: message }, { status: 403 }),

  notFound: (message = '없는 항목입니다.') =>
    NextResponse.json({ error: message }, { status: 404 }),

  badRequest: (message: string | unknown[]) =>
    NextResponse.json({ error: message }, { status: 400 }),

  serverError: (message = '오류가 발생했습니다.') =>
    NextResponse.json({ error: message }, { status: 500 }),
} as const;

// ─── Auth helper ──────────────────────────────────────────────────────────────

/**
 * Resolves the authenticated user ID from the session.
 * Returns a 401 NextResponse when the caller is not authenticated.
 *
 * Usage:
 *   const userId = await requireUserId();
 *   if (userId instanceof NextResponse) return userId;
 */
export async function requireUserId(): Promise<string | NextResponse> {
  const session = await auth();
  if (!session?.user?.id) return apiError.unauthorized();
  return session.user.id as string;
}

// ─── Ownership guards ─────────────────────────────────────────────────────────

/**
 * Fetches a Work row and verifies the caller owns it.
 * Returns the work on success, null if not found or not owned.
 */
export async function getOwnedWork(workId: string, userId: string) {
  const work = await db.work.findUnique({ where: { id: workId } });
  return work?.userId === userId ? work : null;
}

// ─── Domain helpers ───────────────────────────────────────────────────────────

export type FilmRole = 'LEAD' | 'SUPPORTING' | 'EXTRA' | 'OTHER';

/**
 * Converts a free-text role string (Korean or English) to the
 * FilmRole enum value stored in Prisma.
 */
export function mapRoleToFilmRole(myRole?: string | null): FilmRole {
  if (!myRole) return 'OTHER';
  const lower = myRole.toLowerCase();
  if (lower.includes('주연') || lower.includes('lead')) return 'LEAD';
  if (lower.includes('조연') || lower.includes('supporting')) return 'SUPPORTING';
  if (lower.includes('단역') || lower.includes('extra')) return 'EXTRA';
  return 'OTHER';
}

// ─── Error handling ───────────────────────────────────────────────────────────

/**
 * Converts a caught error into the appropriate API error response.
 * Zod validation errors become 400; everything else becomes 500.
 */
export function handleRouteError(err: unknown): NextResponse {
  if (err instanceof z.ZodError) return apiError.badRequest(err.issues);
  return apiError.serverError();
}
