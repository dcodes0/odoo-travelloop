import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import prisma from '@/lib/prisma';

async function verifyStopOwner(tripId, stopId, userId) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) return { error: 'Trip not found.', status: 404 };
  if (trip.userId !== userId) return { error: 'Forbidden.', status: 403 };
  const stop = await prisma.stop.findUnique({ where: { id: stopId } });
  if (!stop || stop.tripId !== tripId) return { error: 'Stop not found.', status: 404 };
  return { trip, stop };
}

export async function PUT(request, { params: paramsPromise }) {
  const params = await paramsPromise;
  try {
    const session = await getIronSession(await cookies(), sessionOptions);
    if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const check = await verifyStopOwner(params.id, params.stopId, session.user.id);
    if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

    const body = await request.json();
    const data = {};
    if (body.cityName !== undefined) data.cityName = body.cityName.trim();
    if (body.arrivalDate !== undefined) data.arrivalDate = new Date(body.arrivalDate);
    if (body.departureDate !== undefined) data.departureDate = new Date(body.departureDate);
    if (body.orderIndex !== undefined) data.orderIndex = body.orderIndex;

    const stop = await prisma.stop.update({ where: { id: params.stopId }, data, include: { activities: true } });
    return NextResponse.json({ stop });
  } catch (e) { return NextResponse.json({ error: 'Failed.' }, { status: 500 }); }
}

export async function DELETE(request, { params: paramsPromise }) {
  const params = await paramsPromise;
  try {
    const session = await getIronSession(await cookies(), sessionOptions);
    if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const check = await verifyStopOwner(params.id, params.stopId, session.user.id);
    if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });
    await prisma.stop.delete({ where: { id: params.stopId } });
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: 'Failed.' }, { status: 500 }); }
}
