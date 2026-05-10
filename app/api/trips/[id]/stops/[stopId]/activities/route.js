import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import prisma from '@/lib/prisma';

async function verifyAccess(tripId, stopId, userId) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) return { error: 'Trip not found.', status: 404 };
  if (trip.userId !== userId) return { error: 'Forbidden.', status: 403 };
  const stop = await prisma.stop.findUnique({ where: { id: stopId } });
  if (!stop || stop.tripId !== tripId) return { error: 'Stop not found.', status: 404 };
  return { trip, stop };
}

export async function GET(request, { params: paramsPromise }) {
  const params = await paramsPromise;
  try {
    const session = await getIronSession(await cookies(), sessionOptions);
    if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const activities = await prisma.activity.findMany({ where: { stopId: params.stopId }, orderBy: { date: 'asc' } });
    return NextResponse.json({ activities });
  } catch (e) { return NextResponse.json({ error: 'Failed.' }, { status: 500 }); }
}

export async function POST(request, { params: paramsPromise }) {
  const params = await paramsPromise;
  try {
    const session = await getIronSession(await cookies(), sessionOptions);
    if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const check = await verifyAccess(params.id, params.stopId, session.user.id);
    if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

    const { title, description, cost, duration, type, date } = await request.json();
    if (!title?.trim()) return NextResponse.json({ error: 'Title is required.' }, { status: 400 });

    const activity = await prisma.activity.create({
      data: {
        stopId: params.stopId,
        title: title.trim(),
        description: description?.trim() || null,
        cost: parseFloat(cost) || 0,
        duration: parseInt(duration) || null,
        type: type || null,
        date: date ? new Date(date) : null,
      },
    });
    return NextResponse.json({ activity }, { status: 201 });
  } catch (e) { return NextResponse.json({ error: 'Failed.' }, { status: 500 }); }
}
