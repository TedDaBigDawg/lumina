import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotAuthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-600">403</h1>
        <h2 className="mt-4 text-3xl font-bold text-gray-900">Not Authorized</h2>
        <p className="mt-2 text-lg text-gray-600">You don't have permission to access this page.</p>
        <div className="mt-6 flex justify-center space-x-4">
          <Link href="/">
            <Button>Go Back Home</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline">Login</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

