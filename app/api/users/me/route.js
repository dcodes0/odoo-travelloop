import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getIronSession(await cookies(), sessionOptions);
    if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id:true, email:true, name:true, role:true, profilePhoto:true, createdAt:true } });
    return NextResponse.json({ user });
  } catch (e) { return NextResponse.json({ error: 'Failed.' }, { status: 500 }); }
}

export async function PUT(request) {
  try {
    const session = await getIronSession(await cookies(), sessionOptions);
    if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { name, profilePhoto } = await request.json();
    const data = {};
    if (name !== undefined) data.name = name?.trim() || null;
    if (profilePhoto !== undefined) data.profilePhoto = profilePhoto?.trim() || null;
    const user = await prisma.user.update({ where: { id: session.user.id }, data, select: { id:true, email:true, name:true, role:true, profilePhoto:true, createdAt:true } });
    return NextResponse.json({ user });
  } catch (e) { return NextResponse.json({ error: 'Failed.' }, { status: 500 }); }
}
