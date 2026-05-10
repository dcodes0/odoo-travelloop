import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { sessionOptions } from '@/lib/session';

export async function GET(request) {
  try {
    const session = await getIronSession(await cookies(), sessionOptions);
    if (!session.user || !session.user.role || session.user.role.toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;

    const where = search ? {
      OR: [
        { name: { contains: search } },
        { email: { contains: search } }
      ]
    } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: { select: { trips: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[ADMIN_USERS]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
