import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import prisma from '@/lib/prisma';

async function verifyOwner(tripId, userId) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) return { error: 'Trip not found.', status: 404 };
  if (trip.userId !== userId) return { error: 'Forbidden.', status: 403 };
  return { trip };
}

export async function GET(request, { params }) {
  try {
    const session = await getIronSession(await cookies(), sessionOptions);
    if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const notes = await prisma.note.findMany({ where: { tripId: params.id }, orderBy: { timestamp: 'desc' } });
    return NextResponse.json({ notes });
  } catch (e) { return NextResponse.json({ error: 'Failed.' }, { status: 500 }); }
}

export async function POST(request, { params }) {
  try {
    const session = await getIronSession(await cookies(), sessionOptions);
    if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const check = await verifyOwner(params.id, session.user.id);
    if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

    const { title, content } = await request.json();
    if (!content?.trim()) return NextResponse.json({ error: 'Note content required.' }, { status: 400 });

    const note = await prisma.note.create({ data: { tripId: params.id, title: title?.trim() || null, content: content.trim() } });
    return NextResponse.json({ note }, { status: 201 });
  } catch (e) { return NextResponse.json({ error: 'Failed.' }, { status: 500 }); }
}
