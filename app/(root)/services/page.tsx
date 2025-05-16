import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ServicesPage() {
  // In a real app, you would fetch this data from your database
  const services = [
    {
      id: "1",
      title: "Sunday Mass",
      description: "Our main worship service of the week.",
      dayOfWeek: 0, // Sunday
      time: "10:00",
    },
    {
      id: "2",
      title: "Wednesday Bible Study",
      description: "Mid-week Bible study and prayer meeting.",
      dayOfWeek: 3, // Wednesday
      time: "18:30",
    },
    {
      id: "3",
      title: "Friday Youth Service",
      description: "Special service for our youth members.",
      dayOfWeek: 5, // Friday
      time: "17:00",
    },
    {
      id: "4",
      title: "Saturday Choir Practice",
      description: "Weekly choir rehearsal for Sunday service.",
      dayOfWeek: 6, // Saturday
      time: "16:00",
    },
  ]

  const sacraments = [
    {
      title: "Baptism",
      description:
        "Baptism services are held on the first Sunday of each month. Please contact the church office to schedule a baptism.",
    },
    {
      title: "Confession",
      description: "Confession is available every Saturday from 4:00 PM to 5:00 PM, or by appointment with the priest.",
    },
    {
      title: "Holy Communion",
      description: "Holy Communion is celebrated during our Sunday Mass and on special holy days.",
    },
    {
      title: "Matrimony",
      description:
        "Wedding ceremonies are available for church members. Please contact the church office at least six months in advance to schedule.",
    },
  ]

  const getDayName = (dayOfWeek: number) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return days[dayOfWeek]
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const formattedHour = hour % 12 || 12
    return `${formattedHour}:${minutes} ${ampm}`
  }

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Our Services</h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">Join us for worship, prayer, and community.</p>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Weekly Schedule</h2>

          <div className="grid gap-6 md:grid-cols-2">
            {services.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <CardTitle>{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{getDayName(service.dayOfWeek)}</span>
                    <span className="font-medium">{formatTime(service.time)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Sacraments & Special Services</h2>

          <div className="grid gap-6 md:grid-cols-2">
            {sacraments.map((sacrament, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{sacrament.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{sacrament.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

