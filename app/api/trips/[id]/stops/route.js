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
    const stops = await prisma.stop.findMany({
      where: { tripId: params.id },
      orderBy: { orderIndex: 'asc' },
      include: { activities: { orderBy: { date: 'asc' } } },
    });
    return NextResponse.json({ stops });
  } catch (e) { return NextResponse.json({ error: 'Failed.' }, { status: 500 }); }
}

export async function POST(request, { params }) {
  try {
    const session = await getIronSession(await cookies(), sessionOptions);
    if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const check = await verifyOwner(params.id, session.user.id);
    if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

    const { cityName, arrivalDate, departureDate } = await request.json();
    if (!cityName?.trim() || !arrivalDate || !departureDate)
      return NextResponse.json({ error: 'City, arrival and departure dates are required.' }, { status: 400 });

    const maxStop = await prisma.stop.findFirst({ where: { tripId: params.id }, orderBy: { orderIndex: 'desc' } });
    const orderIndex = (maxStop?.orderIndex ?? -1) + 1;

    const stop = await prisma.stop.create({
      data: { tripId: params.id, cityName: cityName.trim(), arrivalDate: new Date(arrivalDate), departureDate: new Date(departureDate), orderIndex },
      include: { activities: true },
    });
    return NextResponse.json({ stop }, { status: 201 });
  } catch (e) { return NextResponse.json({ error: 'Failed.' }, { status: 500 }); }
}
