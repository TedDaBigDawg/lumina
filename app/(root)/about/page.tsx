import { Card, CardContent } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">About Our Church</h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">Learn about our history, mission, and vision.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our History</h2>
            <p className="text-gray-600 mb-4">
              Founded in 1980, our church has been serving the community for over four decades. What started as a small
              gathering of faithful individuals has grown into a vibrant community of believers dedicated to spreading
              God's word and love.
            </p>
            <p className="text-gray-600 mb-4">
              Through the years, we have expanded our facilities, programs, and outreach efforts to better serve our
              growing congregation and the wider community.
            </p>
          </div>

          <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
            <p className="text-gray-500">Church Image Placeholder</p>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our Mission & Vision</h2>

          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Mission</h3>
                <p className="text-gray-600">
                  Our mission is to spread the love of Christ, build a community of believers, and serve those in need.
                  We strive to create an environment where everyone feels welcome and can grow in their faith journey.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Vision</h3>
                <p className="text-gray-600">
                  We envision a church that is a beacon of hope and transformation in our community. A place where lives
                  are changed, relationships are healed, and people discover their God-given purpose.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Church Leadership</h2>

          <div className="grid gap-8 md:grid-cols-3">
            {/* {[1, 2, 3].map((leader) => ( */}
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <p className="text-gray-500">Photo</p>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Priest Name</h3>
                <p className="text-gray-600">Parish Priest</p>
              </div>
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <p className="text-gray-500">Photo</p>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Priest Name</h3>
                <p className="text-gray-600">Associate Parish Priest</p>
              </div>
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <p className="text-gray-500">Photo</p>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Priest Name</h3>
                <p className="text-gray-600">Admin</p>
              </div>
            {/* ))} */}
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our Values</h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Faith", description: "Trusting in God's promises and living by His word." },
              { title: "Community", description: "Building meaningful relationships and supporting one another." },
              { title: "Service", description: "Serving others with love and compassion." },
              { title: "Growth", description: "Continuously growing in our relationship with God." },
            ].map((value, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

