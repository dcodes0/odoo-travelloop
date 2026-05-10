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

    // Parallelize aggregate queries for performance
    const [
      totalUsers,
      totalTrips,
      totalStops,
      totalActivities,
      sharedItineraries,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.trip.count(),
      prisma.stop.count(),
      prisma.activity.count(),
      prisma.trip.count({ where: { isPublic: true } }),
    ]);

    // Active users: Users who created a trip in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // For SQLite, distinct count on relation isn't directly supported in a single clean query easily, 
    // so we fetch user IDs that have trips in last 30 days and count them.
    const activeUserRecords = await prisma.trip.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { userId: true },
    });
    const activeUsers = new Set(activeUserRecords.map(t => t.userId)).size;

    // Average Budget: Sum of all activity costs / total trips
    const allActivities = await prisma.activity.aggregate({
      _sum: { cost: true }
    });
    const totalCost = allActivities._sum.cost || 0;
    const avgBudget = totalTrips > 0 ? totalCost / totalTrips : 0;

    // Popular Cities (Top 10)
    const citiesGrouped = await prisma.stop.groupBy({
      by: ['cityName'],
      _count: { cityName: true },
      orderBy: { _count: { cityName: 'desc' } },
      take: 10,
    });
    const topCities = citiesGrouped.map(c => ({
      name: c.cityName,
      count: c._count.cityName,
    }));

    // Activity Categories
    const activitiesGrouped = await prisma.activity.groupBy({
      by: ['type'],
      _count: { type: true },
      orderBy: { _count: { type: 'desc' } },
    });
    const topActivities = activitiesGrouped.map(a => ({
      name: a.type || 'Uncategorized',
      count: a._count.type,
    }));

    // Trips over time (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const tripsOverTimeRaw = await prisma.trip.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const monthlyTripsMap = {};
    tripsOverTimeRaw.forEach(t => {
      const monthYear = t.createdAt.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlyTripsMap[monthYear] = (monthlyTripsMap[monthYear] || 0) + 1;
    });

    // Ensure last 6 months exist in array even if 0
    const tripsOverTime = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      tripsOverTime.push({
        name: label,
        trips: monthlyTripsMap[label] || 0,
      });
    }

    return NextResponse.json({
      overview: {
        totalUsers,
        totalTrips,
        activeUsers,
        sharedItineraries,
        avgBudget: Math.round(avgBudget),
        totalCities: totalStops,
        totalActivities,
        avgTripDuration: 5 // Placeholder for now, hard to calculate accurately across all trips without raw SQL
      },
      topCities,
      topActivities,
      tripsOverTime,
    });
  } catch (error) {
    console.error('[ADMIN_ANALYTICS]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
