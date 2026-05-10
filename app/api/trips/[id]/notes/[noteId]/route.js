import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import prisma from '@/lib/prisma';

export async function PUT(request, { params: paramsPromise }) {
  const params = await paramsPromise;
  try {
    const session = await getIronSession(await cookies(), sessionOptions);
    if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { title, content } = await request.json();
    const data = {};
    if (title !== undefined) data.title = title?.trim() || null;
    if (content !== undefined) data.content = content.trim();
    const note = await prisma.note.update({ where: { id: params.noteId }, data });
    return NextResponse.json({ note });
  } catch (e) { return NextResponse.json({ error: 'Failed.' }, { status: 500 }); }
}

export async function DELETE(request, { params: paramsPromise }) {
  const params = await paramsPromise;
  try {
    const session = await getIronSession(await cookies(), sessionOptions);
    if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await prisma.note.delete({ where: { id: params.noteId } });
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: 'Failed.' }, { status: 500 }); }
}
