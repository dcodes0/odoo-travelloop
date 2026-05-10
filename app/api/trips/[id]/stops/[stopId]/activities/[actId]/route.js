import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import prisma from '@/lib/prisma';

async function verifyAccess(tripId, actId, userId) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip || trip.userId !== userId) return { error: 'Forbidden.', status: 403 };
  const activity = await prisma.activity.findUnique({ where: { id: actId } });
  if (!activity) return { error: 'Activity not found.', status: 404 };
  return { activity };
}

export async function PUT(request, { params: paramsPromise }) {
  const params = await paramsPromise;
  try {
    const session = await getIronSession(await cookies(), sessionOptions);
    if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const check = await verifyAccess(params.id, params.actId, session.user.id);
    if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

    const body = await request.json();
    const data = {};
    if (body.title !== undefined) data.title = body.title.trim();
    if (body.description !== undefined) data.description = body.description?.trim() || null;
    if (body.cost !== undefined) data.cost = parseFloat(body.cost) || 0;
    if (body.duration !== undefined) data.duration = parseInt(body.duration) || null;
    if (body.type !== undefined) data.type = body.type || null;
    if (body.date !== undefined) data.date = body.date ? new Date(body.date) : null;

    const activity = await prisma.activity.update({ where: { id: params.actId }, data });
    return NextResponse.json({ activity });
  } catch (e) { return NextResponse.json({ error: 'Failed.' }, { status: 500 }); }
}

export async function DELETE(request, { params: paramsPromise }) {
  const params = await paramsPromise;
  try {
    const session = await getIronSession(await cookies(), sessionOptions);
    if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const check = await verifyAccess(params.id, params.actId, session.user.id);
    if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });
    await prisma.activity.delete({ where: { id: params.actId } });
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: 'Failed.' }, { status: 500 }); }
}
