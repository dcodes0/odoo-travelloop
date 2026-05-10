import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import prisma from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const session = await getIronSession(await cookies(), sessionOptions);
    if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const data = {};
    if (body.isPacked !== undefined) data.isPacked = Boolean(body.isPacked);
    if (body.item !== undefined) data.item = body.item.trim();
    if (body.category !== undefined) data.category = body.category;
    const updated = await prisma.checklistItem.update({ where: { id: params.itemId }, data });
    return NextResponse.json({ item: updated });
  } catch (e) { return NextResponse.json({ error: 'Failed.' }, { status: 500 }); }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getIronSession(await cookies(), sessionOptions);
    if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await prisma.checklistItem.delete({ where: { id: params.itemId } });
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: 'Failed.' }, { status: 500 }); }
}
