import { prisma } from "@/lib/db"
import type { Event, Mass } from "@/components/pages/home/home-client"
import { MassStatus } from "@prisma/client"

/**
 * Fetches upcoming events from the database
 * @param limit Number of events to fetch
 * @returns Array of upcoming events
 */
export async function getUpcomingEvents(limit = 2): Promise<Event[]> {
  return (await prisma.event.findMany({
    where: {
      date: { gte: new Date() },
    },
    orderBy: { date: "asc" },
    take: limit,
  })) as Event[]
}


/**
 * Fetches upcoming masses from the database
 * @param limit Number of masses to fetch
 * @returns Array of upcoming masses with availability information
 */
export async function getUpcomingMasses(limit = 2): Promise<Mass[]> {
  const upcomingMasses = await prisma.mass.findMany({
    where: {
      date: { gte: new Date() },
      status: MassStatus.AVAILABLE,
    },
    orderBy: { date: "asc" },
    take: limit,
    select: {
      id: true,
      title: true,
      date: true,
      location: true,
      status: true,
      // Calculate available slots
      _count: {
        select: {
          massIntentions: true,
          thanksgivings: true,
        },
      },
      // Get the maximum slots configuration
      availableIntentionsSlots: true,
      availableThanksgivingsSlots: true,
    },
  })

  // Transform the masses to include available slots information
  return upcomingMasses.map((mass) => ({
    id: mass.id,
    title: mass.title,
    date: mass.date,
    location: mass.location,
    status: mass.status,
    availableIntentionsSlots: mass.availableIntentionsSlots ? mass.availableIntentionsSlots - mass._count.massIntentions : 0,
    availableThanksgivingsSlots: mass.availableThanksgivingsSlots ? mass.availableThanksgivingsSlots - mass._count.thanksgivings : 0,
  })) as Mass[]
}
