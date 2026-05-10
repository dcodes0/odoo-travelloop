import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';

export async function GET() {
  try {
    const session = await getIronSession(await cookies(), sessionOptions);
    if (!session.user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    return NextResponse.json({ user: session.user });
  } catch (error) {
    console.error('[ME]', error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
