"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from "@/components/ui/modal"
import { Clock, MapPin, Users, CheckCircle, ArrowRight } from "lucide-react"
import { formatDate2 } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface Event {
  id: string
  title: string
  description: string
  date: Date | string
  location: string
  capacity?: number | null
}

interface EventDetailsModalProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
}

export function EventDetailsModal({ event, isOpen, onClose }: EventDetailsModalProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!event) return null

  const handleSignUp = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      router.push(`/register`)
      setIsSubmitting(false)
    }, 300)
  }

  return (
    <Modal open={isOpen} onClose={onClose} className="max-w-lg rounded-xl">
      <ModalHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-xl">
        <ModalTitle>{event.title}</ModalTitle>
        <p className="text-purple-100 text-sm">{formatDate2(new Date(event.date))}</p>
      </ModalHeader>
      <ModalBody className="space-y-6 p-6">
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Time</p>
            <p className="text-sm text-gray-600">
              {new Date(event.date).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Location</p>
            <p className="text-sm text-gray-600">{event.location}</p>
          </div>
        </div>
        {event.capacity && (
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Capacity</p>
              <p className="text-sm text-gray-600">{event.capacity} people</p>
            </div>
          </div>
        )}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">About</h4>
          <p className="text-sm text-gray-600">{event.description}</p>
        </div>
        <Button
          onClick={handleSignUp}
          disabled={isSubmitting}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full py-3"
        >
          {isSubmitting ? (
            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <>
              Sign Up
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </ModalBody>
      <ModalFooter className="bg-gray-50 rounded-b-xl">
        <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
          Close
        </Button>
      </ModalFooter>
    </Modal>
  )
}