import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getIronSession(await cookies(), sessionOptions);
    if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const trips = await prisma.trip.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        stops: { include: { activities: true } },
        _count: { select: { checklistItems: true, notes: true } },
      },
    });

    return NextResponse.json({ trips });
  } catch (error) {
    console.error('[GET /api/trips]', error);
    return NextResponse.json({ error: 'Failed to fetch trips.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getIronSession(await cookies(), sessionOptions);
    if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, description, startDate, endDate, currency, coverPhoto } = await request.json();

    if (!name?.trim() || !startDate || !endDate) {
      return NextResponse.json({ error: 'Name, start date, and end date are required.' }, { status: 400 });
    }
    if (new Date(endDate) < new Date(startDate)) {
      return NextResponse.json({ error: 'End date must be after start date.' }, { status: 400 });
    }

    const trip = await prisma.trip.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        description: description?.trim() || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        currency: currency || 'USD',
        coverPhoto: coverPhoto || null,
      },
    });

    return NextResponse.json({ trip }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/trips]', error);
    return NextResponse.json({ error: 'Failed to create trip.' }, { status: 500 });
  }
}
