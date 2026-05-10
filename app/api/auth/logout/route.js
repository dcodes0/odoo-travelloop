import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';

export async function POST() {
  try {
    const session = await getIronSession(await cookies(), sessionOptions);
    session.destroy();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[LOGOUT]', error);
    return NextResponse.json({ error: 'Logout failed.' }, { status: 500 });
  }
}
