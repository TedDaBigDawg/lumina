import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-blue-900">404</h1>
        <h2 className="mt-4 text-3xl font-bold text-gray-900">Page Not Found</h2>
        <p className="mt-2 text-lg text-gray-600">The page you are looking for doesn't exist or has been moved.</p>
        <div className="mt-6">
          <Link href="/">
            <Button>Go Back Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

