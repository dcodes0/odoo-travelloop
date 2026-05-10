import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const session = await getIronSession(await cookies(), sessionOptions);
    if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    return NextResponse.json({ user });
  } catch (e) { return NextResponse.json({ error: 'Failed.' }, { status: 500 }); }
}

export async function PUT(request) {
  try {
    const session = await getIronSession(await cookies(), sessionOptions);
    if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, email, currentPassword, newPassword } = await request.json();
    const data = {};

    if (name !== undefined) data.name = name?.trim() || null;

    // Email change
    if (email && email.trim()) {
      const trimmedEmail = email.trim().toLowerCase();
      const existing = await prisma.user.findUnique({ where: { email: trimmedEmail } });
      if (existing && existing.id !== session.user.id) {
        return NextResponse.json({ error: 'That email is already in use.' }, { status: 409 });
      }
      data.email = trimmedEmail;
    }

    // Password change
    if (newPassword) {
      if (!currentPassword) return NextResponse.json({ error: 'Current password is required to set a new one.' }, { status: 400 });
      if (newPassword.length < 8) return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 });
      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 });
      data.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    // Update session if email changed
    if (data.email) {
      session.user.email = user.email;
      await session.save();
    }

    return NextResponse.json({ user });
  } catch (e) {
    console.error('[PUT /api/users/me]', e);
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
  }
}
