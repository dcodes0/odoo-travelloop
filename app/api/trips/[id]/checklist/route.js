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

export async function GET(request, { params: paramsPromise }) {
  const params = await paramsPromise;
  try {
    const session = await getIronSession(await cookies(), sessionOptions);
    if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const items = await prisma.checklistItem.findMany({ where: { tripId: params.id }, orderBy: [{ category: 'asc' }, { item: 'asc' }] });
    return NextResponse.json({ items });
  } catch (e) { return NextResponse.json({ error: 'Failed.' }, { status: 500 }); }
}

export async function POST(request, { params: paramsPromise }) {
  const params = await paramsPromise;
  try {
    const session = await getIronSession(await cookies(), sessionOptions);
    if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const check = await verifyOwner(params.id, session.user.id);
    if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

    const { item, category } = await request.json();
    if (!item?.trim()) return NextResponse.json({ error: 'Item text required.' }, { status: 400 });

    const created = await prisma.checklistItem.create({ data: { tripId: params.id, item: item.trim(), category: category || 'Miscellaneous', isPacked: false } });
    return NextResponse.json({ item: created }, { status: 201 });
  } catch (e) { return NextResponse.json({ error: 'Failed.' }, { status: 500 }); }
}
