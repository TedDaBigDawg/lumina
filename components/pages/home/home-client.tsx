"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  Calendar,
  Users,
  Heart,
  ChevronRight,
  ArrowRight,
  UserPlus,
  Clock,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { EventDetailsModal } from "@/components/event-details-modal"
import { MassDetailsModal } from "@/components/mass-details-modal"
import { quickAccessLinks, quickLinks } from "@/lib/home-links"
import { formatDate2 } from "@/lib/utils"

// Types from old UI
export interface Event {
  id: string
  title: string
  description: string
  date: Date | string
  location: string
  capacity?: number | null
}

export interface Mass {
  id: string
  title: string
  date: Date | string
  location: string
  availableIntentionsSlots: number
  availableThanksgivingsSlots: number
  status: string
}

interface HomeClientProps {
  upcomingEvents: Event[];
  upcomingMasses: Mass[];
}

export default function HomePage({ upcomingEvents, upcomingMasses }: HomeClientProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedMass, setSelectedMass] = useState<Mass | null>(null)
  const [eventModalOpen, setEventModalOpen] = useState(false)
  const [massModalOpen, setMassModalOpen] = useState(false)

  const openEventModal = (event: Event) => {
    setSelectedEvent(event)
    setEventModalOpen(true)
  }

  const openMassModal = (mass: Mass) => {
    setSelectedMass(mass)
    setMassModalOpen(true)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">

      <main className="flex-1">
        <section className="relative pt-24 pb-16 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-1/2 h-[600px] bg-gradient-to-bl from-blue-100 to-transparent rounded-bl-[120px] opacity-70"></div>
            <div className="absolute top-40 left-20 w-32 h-32 rounded-full bg-gold-100 opacity-60"></div>
            <div className="absolute bottom-0 left-0 w-1/3 h-[400px] bg-gradient-to-tr from-purple-100 to-transparent rounded-tr-[120px] opacity-70"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-blue-900"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                St. Kizito Catholic Church
              </motion.h1>
              <motion.p
                className="mt-4 text-lg sm:text-xl text-gray-600"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Connect, worship, and grow in faith with our community.
              </motion.p>
              <motion.div
                className="mt-8 flex flex-col sm:flex-row justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                  <Button className="w-full sm:w-auto bg-gold-500 hover:bg-gold-600 text-blue-900 font-semibold px-8 py-3 text-lg rounded-full">
                <Link className="flex mx-auto items-center justify-center" href="/services">
                    Explore Services
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                  </Button>
                <Link href="/register">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-lg rounded-full px-8 py-3"
                  >
                    Join Us
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Hero Image */}
            <div className="relative mt-12 h-[400px] md:h-[500px] overflow-hidden rounded-t-[40px] shadow-2xl">
              <Image
                src="/images/image.png"
                alt="Church worship"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 to-transparent flex items-end">
                <div className="p-6 md:p-10 w-full">
                  <h2 className="text-white text-2xl md:text-3xl font-serif font-bold mb-2">
                    Sunday Mass
                  </h2>
                  <p className="text-white/90 mb-4">
                    Join us this Sunday at 9:00 AM for worship and fellowship
                  </p>
                  <Link href="/register">
                  <Button className="z-50  bg-gold-500 hover:bg-gold-600 text-blue-900">
                    Learn More
                  </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Info Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <StatCard
                icon={<Clock className="h-6 w-6 text-blue-600" />}
                value="7:00 AM, 9:00 AM, 11:00 AM"
                label="Sunday Mass"
              />
              <StatCard
                icon={<MapPin className="h-6 w-6 text-blue-600" />}
                value="123 Iju Ishaga, Station Juction"
                label="Lagos, Nigeria"
              />
              <StatCard
                icon={<Users className="h-6 w-6 text-blue-600" />}
                value="1000+"
                label="Faithful Members"
              />
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
    {/* Quick Access Cards */}
    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {quickAccessLinks.map((link: any, index: any) => (
        <QuickAccessCard
          key={index}
          title={link.title}
          description={link.description}
          icon={<link.icon className="h-6 w-6" />}
          href={link.href}
          color={link.color}
          iconColor={link.iconColor}
        />
      ))}
    </div>

    {/* Worship Schedule & Quick Links */}
    <div className="space-y-6">
      <Card className="border-none shadow-lg bg-blue-900 text-white">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-gold-500" />
              <h3 className="font-serif font-bold">Mass Times</h3>
            </div>
            <Link href="/services">
              <Button
                variant="ghost"
                className="text-gold-500 hover:text-gold-400 hover:bg-blue-800"
              >
                All Services
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            <p className="text-sm">Sundays: 7:00 AM, 9:00 AM, 11:00 AM</p>
            <p className="text-sm">Weekdays: 6:30 AM</p>
          </div>
        </div>
      </Card>

      <Card className="border-none shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="p-6">
          <h3 className="font-serif font-bold mb-4">Quick Links</h3>
          <div className="grid grid-cols-2 gap-2">
            {quickLinks.map((link: any, index: any) => (
                <Button
                key={index} 
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10 justify-start text-sm"
                >
              <Link className="flex mx-auto items-center justify-center" href={link.href}>
                  <link.icon className="mr-1 h-3.5 w-3.5" />
                  {link.title}
              </Link>
                </Button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  </div>

  {/* Upcoming Masses and Events - Separate Section for Side-by-Side Grids */}
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-12">
      {/* Upcoming Masses */}
      <Card className="overflow-hidden border-none shadow-lg">
        <div className="p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg lg:text-xl font-serif font-bold flex items-center">
              <Calendar className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              Upcoming Masses
            </h3>
            <Badge
              variant="outline"
              className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs sm:text-sm"
            >
              This Week
            </Badge>
          </div>
          {upcomingMasses.length > 0 ? (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              {upcomingMasses.slice(0, 4).map((mass) => (
                <Card
                  key={mass.id}
                  className="border-none shadow-md hover:shadow-lg transition-all bg-white rounded-xl"
                >
                  <div className="bg-blue-600 text-white rounded-t-xl p-2 sm:p-3 lg:p-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm sm:text-base lg:text-lg font-semibold line-clamp-1">
                        {mass.title}
                      </h4>
                      <span className="bg-blue-800 text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                        {mass.availableIntentionsSlots > 0
                          ? `${mass.availableIntentionsSlots} slots`
                          : "Full"}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 sm:p-3 lg:p-4">
                    <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
                      <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg text-center min-w-[44px] sm:min-w-[48px] lg:min-w-[50px]">
                        <div className="text-base sm:text-lg lg:text-xl font-bold text-blue-700">
                          {new Date(mass.date).getDate()}
                        </div>
                        <div className="text-[10px] sm:text-xs text-blue-700">
                          {new Date(mass.date).toLocaleString("default", { month: "short" })}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">
                          {new Date(mass.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
                          <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 mr-1 text-blue-600" />
                          {new Date(mass.date).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center line-clamp-1">
                          <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 mr-1 text-blue-600" />
                          {mass.location}
                        </p>
                        <Button
                          variant="outline"
                          className="mt-2 sm:mt-3 lg:mt-4 w-full border-blue-600 text-blue-600 hover:bg-blue-50 text-xs sm:text-sm lg:text-base py-1.5 sm:py-2"
                          onClick={() => openMassModal(mass)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 sm:py-6 lg:py-8">
              <Calendar className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-blue-600 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900">
                No Upcoming Masses
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
                Check back soon for updates.
              </p>
            </div>
          )}
        </div>
        <div className="bg-blue-50 p-2 sm:p-3 lg:p-4 flex justify-end">
          <Button
            variant="ghost"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 text-xs sm:text-sm lg:text-base"
          >
            <Link className="flex items-center justify-center" href="/services">
              View All Masses
              <ChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
            </Link>
          </Button>
        </div>
      </Card>

      {/* Upcoming Events */}
      <Card className="overflow-hidden border-none shadow-lg">
        <div className="p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg lg:text-xl font-serif font-bold flex items-center">
              <Calendar className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              Upcoming Events
            </h3>
            <Badge
              variant="outline"
              className="bg-purple-100 text-purple-800 hover:bg-purple-200 text-xs sm:text-sm"
            >
              This Week
            </Badge>
          </div>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {upcomingEvents.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-3 lg:p-4 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  <div className="bg-purple-100 p-1.5 sm:p-2 rounded-lg text-center min-w-[44px] sm:min-w-[48px] lg:min-w-[50px]">
                    <div className="text-base sm:text-lg lg:text-xl font-bold text-purple-700">
                      {new Date(event.date).getDate()}
                    </div>
                    <div className="text-[10px] sm:text-xs text-purple-700">
                      {new Date(event.date).toLocaleString("default", { month: "short" })}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 line-clamp-1">
                      {event.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">{event.location}</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                      {event.description}
                    </p>
                    <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600 flex items-center">
                      <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 mr-1" />
                      {new Date(event.date).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <Button
                      variant="outline"
                      className="mt-2 sm:mt-3 lg:mt-4 w-full border-purple-600 text-purple-600 hover:bg-purple-50 text-xs sm:text-sm lg:text-base py-1.5 sm:py-2"
                      onClick={() => openEventModal(event)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 sm:py-6 lg:py-8">
              <Calendar className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-purple-600 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900">
                No Upcoming Events
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
                Stay tuned for upcoming events.
              </p>
            </div>
          )}
        </div>
        <div className="bg-purple-50 p-2 sm:p-3 lg:p-4 flex justify-end">
          <Button
            variant="ghost"
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-100 text-xs sm:text-sm lg:text-base"
          >
            <Link className="flex items-center justify-center" href="/events">
              View Calendar
              <ChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  </div>

  {/* Events and Newsletter */}
  {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
    <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white">
      <div className="p-6">
        <h3 className="text-xl font-serif font-bold mb-4 flex items-center">
          <Heart className="mr-2 h-5 w-5" />
          Stay Connected
        </h3>
        <p className="text-blue-100 mb-4">
          Subscribe to our newsletter for updates on masses, events, and more.
        </p>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="Your email"
            className="bg-blue-800 border-blue-700 text-white placeholder:text-blue-400"
          />
          <Button className="bg-gold-500 hover:bg-gold-600 text-blue-900">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-blue-200 mt-2">
          We respect your privacy. Unsubscribe anytime.
        </p>
      </div>
    </Card>
  </div> */}
</section>

        {/* CTA Section */}
        <section className="relative bg-blue-900 text-white py-20">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-purple-900 opacity-90"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold">
              Join Our Faithful Community
            </h2>
            <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
              Register to access all features and stay connected with St. Kizito.
            </p>
            <Link href="/register">
              <Button className="mt-8 bg-gold-500 hover:bg-gold-600 text-blue-900 font-semibold px-8 py-4 text-lg rounded-full">
                <UserPlus className="h-6 w-6 mr-2" />
                Register Now
              </Button>
            </Link>
            <p className="mt-4 text-sm text-blue-200">
              Already a member?{" "}
              <Link href="/login" className="underline hover:text-white">
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </main>

      {/* Modals */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
      />
      <MassDetailsModal
        mass={selectedMass}
        isOpen={massModalOpen}
        onClose={() => setMassModalOpen(false)}
      />
    </div>
  )
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <Card className="p-4 border-none shadow-md bg-white hover:shadow-lg transition-all">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
          {icon}
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-600">{label}</p>
        </div>
      </div>
    </Card>
  )
}

function QuickAccessCard({
  title,
  description,
  icon,
  href,
  color,
  iconColor,
}: {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  color: string
  iconColor: string
}) {
  return (
    <Link href={href} className="block h-full">
      <Card className={`h-full fle p-6 border-none shadow-md hover:shadow-lg transition-all ${color} group`}>
        <motion.div
          className={`flex items-center justify-center w-12 h-12 rounded-full ${iconColor} text-white mb-4`}
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {icon}
        </motion.div>
        <h3 className="font-serif font-bold mb-1 text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </Card>
    </Link>
  )
}