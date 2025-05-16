import HomeClient from "@/components/pages/home/home-client"
import { getUpcomingEvents, getUpcomingMasses } from "@/lib/data-utils"

export default async function HomePage() {
  const [upcomingEvents, upcomingMasses] = await Promise.all([getUpcomingEvents(2), getUpcomingMasses(2)])

  return <HomeClient upcomingEvents={upcomingEvents} upcomingMasses={upcomingMasses} />
}
