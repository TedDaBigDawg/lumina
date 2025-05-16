import { Form, FormField, FormLabel, FormInput, FormTextarea } from "@/components/ui/form"
import { Button } from "@/components/ui/button"

export default function ContactPage() {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Contact Us</h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            We'd love to hear from you. Get in touch with us.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Get In Touch</h2>

            <Form className="space-y-6">
              <FormField>
                <FormLabel htmlFor="name">Name</FormLabel>
                <FormInput id="name" name="name" required />
              </FormField>

              <FormField>
                <FormLabel htmlFor="email">Email</FormLabel>
                <FormInput id="email" name="email" type="email" required />
              </FormField>

              <FormField>
                <FormLabel htmlFor="subject">Subject</FormLabel>
                <FormInput id="subject" name="subject" required />
              </FormField>

              <FormField>
                <FormLabel htmlFor="message">Message</FormLabel>
                <FormTextarea id="message" name="message" rows={5} required />
              </FormField>

              <Button type="submit">Send Message</Button>
            </Form>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Church Information</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Address</h3>
                <address className="not-italic text-gray-600">
                  <p>123 Church Street</p>
                  <p>City, State 12345</p>
                </address>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact</h3>
                <p className="text-gray-600">Phone: (123) 456-7890</p>
                <p className="text-gray-600">Email: info@churchapp.com</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Office Hours</h3>
                <p className="text-gray-600">Monday - Friday: 9:00 AM - 5:00 PM</p>
                <p className="text-gray-600">Saturday: 10:00 AM - 2:00 PM</p>
                <p className="text-gray-600">Sunday: Closed (except for services)</p>
              </div>
            </div>

            <div className="mt-8 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Google Maps Embed Placeholder</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

