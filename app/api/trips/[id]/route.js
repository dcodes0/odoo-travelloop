import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import prisma from '@/lib/prisma';

async function getAuthedUser() {
  const session = await getIronSession(await cookies(), sessionOptions);
  return session.user ?? null;
}

// GET /api/trips/[id]
export async function GET(request, { params: paramsPromise }) {
  const params = await paramsPromise;
  try {
    const user = await getAuthedUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const trip = await prisma.trip.findUnique({
      where: { id: params.id },
      include: {
        stops: {
          orderBy: { orderIndex: 'asc' },
          include: { activities: { orderBy: { date: 'asc' } } },
        },
        checklistItems: { orderBy: { category: 'asc' } },
        notes: { orderBy: { timestamp: 'desc' } },
      },
    });

    if (!trip) return NextResponse.json({ error: 'Trip not found.' }, { status: 404 });
    if (trip.userId !== user.id && !trip.isPublic) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    return NextResponse.json({ trip });
  } catch (error) {
    console.error('[GET /api/trips/[id]]', error);
    return NextResponse.json({ error: 'Failed to fetch trip.' }, { status: 500 });
  }
}

// PUT /api/trips/[id]
export async function PUT(request, { params: paramsPromise }) {
  const params = await paramsPromise;
  try {
    const user = await getAuthedUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const existing = await prisma.trip.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Trip not found.' }, { status: 404 });
    if (existing.userId !== user.id) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });

    const body = await request.json();
    const data = {};

    if (body.name !== undefined) data.name = body.name.trim();
    if (body.description !== undefined) data.description = body.description?.trim() || null;
    if (body.startDate !== undefined) data.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) data.endDate = new Date(body.endDate);
    if (body.currency !== undefined) data.currency = body.currency;
    if (body.coverPhoto !== undefined) data.coverPhoto = body.coverPhoto || null;
    if (body.isPublic !== undefined) data.isPublic = Boolean(body.isPublic);

    const trip = await prisma.trip.update({ where: { id: params.id }, data });
    return NextResponse.json({ trip });
  } catch (error) {
    console.error('[PUT /api/trips/[id]]', error);
    return NextResponse.json({ error: 'Failed to update trip.' }, { status: 500 });
  }
}

// DELETE /api/trips/[id]
export async function DELETE(request, { params: paramsPromise }) {
  const params = await paramsPromise;
  try {
    const user = await getAuthedUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const existing = await prisma.trip.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Trip not found.' }, { status: 404 });
    if (existing.userId !== user.id) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });

    await prisma.trip.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[DELETE /api/trips/[id]]', error);
    return NextResponse.json({ error: 'Failed to delete trip.' }, { status: 500 });
  }
}
