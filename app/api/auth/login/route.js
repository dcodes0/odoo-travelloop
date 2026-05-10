import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { sessionOptions } from '@/lib/session';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    // Use constant-time compare even on not-found to prevent timing attacks
    const dummyHash = '$2a$12$aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const valid = user
      ? await bcrypt.compare(password, user.passwordHash)
      : await bcrypt.compare(password, dummyHash);

    if (!user || !valid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const session = await getIronSession(await cookies(), sessionOptions);
    session.user = { id: user.id, email: user.email, name: user.name, role: user.role };
    await session.save();

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error('[LOGIN]', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
