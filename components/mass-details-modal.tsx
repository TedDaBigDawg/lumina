"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from "@/components/ui/modal"
import { Calendar, Clock, MapPin } from "lucide-react"
import { formatDate2 } from "@/lib/utils"

interface Mass {
  id: string
  title: string
  date: Date | string
  location: string
  availableIntentionsSlots: number
  availableThanksgivingsSlots: number
  status: string
}

interface MassDetailsModalProps {
  mass: Mass | null
  isOpen: boolean
  onClose: () => void
}

export function MassDetailsModal({ mass, isOpen, onClose }: MassDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<"details" | "intention" | "thanksgiving">("details")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!mass) return null

  const handleSignUp = (type: "intention" | "thanksgiving") => {
    setIsSubmitting(true)
    setTimeout(() => {
      window.location.href = `/register`
      setIsSubmitting(false)
    }, 300)
  }

  return (
    <Modal open={isOpen} onClose={onClose} className="max-w-lg rounded-xl">
      <ModalHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-xl">
        <ModalTitle>{mass.title}</ModalTitle>
        <p className="text-blue-100 text-sm">{formatDate2(new Date(mass.date))}</p>
      </ModalHeader>
      <ModalBody className="border-b bg-white">
        <div className="flex">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "details" ? "border-b-2 border-blue-600 text-[#1a1a1a]" : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("details")}
          >
            Details
          </button>
          {mass.availableIntentionsSlots > 0 && (
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "intention" ? "border-b-2 border-blue-600 text-[#1a1a1a]" : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("intention")}
            >
              Intention
            </button>
          )}
          {mass.availableThanksgivingsSlots > 0 && (
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "thanksgiving" ? "border-b-2 border-blue-600 text-[#1a1a1a]" : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("thanksgiving")}
            >
              Thanksgiving
            </button>
          )}
        </div>
      </ModalBody>
      <ModalBody className="p-6 space-y-6">
        {activeTab === "details" && (
          <>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-[#1a1a1a] mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Time</p>
                <p className="text-sm text-gray-600">
                  {new Date(mass.date).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-[#1a1a1a] mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Location</p>
                <p className="text-sm text-gray-600">{mass.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-[#1a1a1a] mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Date</p>
                <p className="text-sm text-gray-600">
                  {new Date(mass.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-900">Intention Slots</span>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                  {mass.availableIntentionsSlots}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-900">Thanksgiving Slots</span>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                  {mass.availableThanksgivingsSlots}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-900">Status</span>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    mass.status === "AVAILABLE" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {mass.status}
                </span>
              </div>
            </div>
          </>
        )}
        {activeTab === "intention" && (
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Request a Mass Intention</h3>
            <p className="text-gray-600">
              {mass.availableIntentionsSlots > 1
                ? `${mass.availableIntentionsSlots} slots available.`
                : "Only 1 slot available."}
            </p>
            <Button
              onClick={() => handleSignUp("intention")}
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-3"
            >
              {isSubmitting ? (
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                "Sign Up"
              )}
            </Button>
          </div>
        )}
        {activeTab === "thanksgiving" && (
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Thanksgiving Offering</h3>
            <p className="text-gray-600">
              {mass.availableThanksgivingsSlots > 1
                ? `${mass.availableThanksgivingsSlots} slots available.`
                : "Only 1 slot available."}
            </p>
            <Button
              onClick={() => handleSignUp("thanksgiving")}
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-3"
            >
              {isSubmitting ? (
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                "Sign Up"
              )}
            </Button>
          </div>
        )}
      </ModalBody>
      <ModalFooter className="bg-gray-50 rounded-b-xl">
        <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
          Close
        </Button>
      </ModalFooter>
    </Modal>
  )
}