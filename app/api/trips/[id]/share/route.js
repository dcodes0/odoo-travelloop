import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import prisma from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const session = await getIronSession(await cookies(), sessionOptions);
    if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const trip = await prisma.trip.findUnique({ where: { id: params.id } });
    if (!trip) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    if (trip.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });

    const { isPublic } = await request.json();
    const updated = await prisma.trip.update({ where: { id: params.id }, data: { isPublic: Boolean(isPublic) } });
    return NextResponse.json({ trip: updated });
  } catch (e) { return NextResponse.json({ error: 'Failed.' }, { status: 500 }); }
}
