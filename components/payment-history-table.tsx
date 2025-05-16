"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatDate, formatCurrency } from "@/lib/utils"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"

interface Payment {
  id: string
  type: "DONATION" | "OFFERING"
  amount: number
  status: "PAID" | "UNPAID" | "FAILED"
  createdAt: Date
  category?: string
  description?: string
  goal?: {
    id: string
    title: string
  }
}

interface PaymentHistoryTableProps {
  payments: Payment[]
  type: "DONATION" | "OFFERING"
}

export function PaymentHistoryTable({ payments, type }: PaymentHistoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Calculate total pages
  const totalPages = Math.ceil(payments.length / itemsPerPage)

  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = payments.slice(indexOfFirstItem, indexOfLastItem)

  // Change page
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 3 // Reduced for better mobile display

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max to show
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Always include current page
      pageNumbers.push(currentPage)

      // Add previous page if not first page
      if (currentPage > 1) {
        pageNumbers.unshift(currentPage - 1)
      }

      // Add next page if not last page
      if (currentPage < totalPages) {
        pageNumbers.push(currentPage + 1)
      }

      // If we still have room and not showing first page, add first page
      if (pageNumbers.length < maxPagesToShow && !pageNumbers.includes(1)) {
        pageNumbers.unshift(1)
      }

      // If we still have room and not showing last page, add last page
      if (pageNumbers.length < maxPagesToShow && !pageNumbers.includes(totalPages)) {
        pageNumbers.push(totalPages)
      }

      // Sort the page numbers
      pageNumbers.sort((a, b) => a - b)

      // Add ellipsis where needed
      const result = []
      let lastNum = 0

      for (const num of pageNumbers) {
        if (lastNum && num - lastNum > 1) {
          result.push("ellipsis")
        }
        result.push(num)
        lastNum = num
      }

      return result
    }

    return pageNumbers
  }

  // Function to format date in a more compact way for smaller screens
  const formatCompactDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
    return new Date(date).toLocaleDateString(undefined, options)
  }

  return (
    <div>
      {/* For medium and large screens */}
      <div className="hidden sm:block">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[130px] md:w-[150px]"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {type === "DONATION" ? "Category" : "Description"}
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]"
                >
                  Amount
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[140px]"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length > 0 ? (
                currentItems.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-4 py-3 text-sm">
                      <div className="text-sm text-gray-500 min-w-[110px]">{formatDate(payment.createdAt)}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {type === "DONATION" ? (
                        <>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.category?.replace("_", " ") || "-"}
                          </div>
                          {payment.goal && <div className="text-xs text-gray-500">For: {payment.goal.title}</div>}
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">{payment.description || "-"}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(payment.amount)}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payment.status === "PAID"
                            ? "bg-green-100 text-green-800"
                            : payment.status === "FAILED"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {payment.status === "UNPAID" && (
                        <Link href={`/dashboard/payments/${payment.id}/pay`}>
                          <Button size="sm" variant="outline" className="whitespace-nowrap text-xs">
                            Complete Payment
                          </Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-center text-sm text-gray-500">
                    No {type.toLowerCase()} history.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* For mobile screens */}
      <div className="sm:hidden px-4">
        {currentItems.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {currentItems.map((payment) => (
              <li key={payment.id} className="py-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="text-sm font-medium text-gray-900">
                      {type === "DONATION" ? payment.category?.replace("_", " ") || "General Donation" : "Offering"}
                    </div>
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(payment.amount)}</div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">{formatCompactDate(payment.createdAt)}</div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.status === "PAID"
                          ? "bg-green-100 text-green-800"
                          : payment.status === "FAILED"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>

                  {payment.goal && <div className="text-xs text-gray-500">For: {payment.goal.title}</div>}

                  {payment.description && type === "OFFERING" && (
                    <div className="text-sm text-gray-500">{payment.description}</div>
                  )}

                  {payment.status === "UNPAID" && (
                    <div className="mt-2">
                      <Link href={`/dashboard/payments/${payment.id}/pay`}>
                        <Button size="sm" variant="outline" className="w-full text-xs">
                          Complete Payment
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center py-4">No {type.toLowerCase()} history.</p>
        )}
      </div>

      {payments.length > 0 && totalPages > 1 && (
        <div className="mt-6 px-4 pb-4 overflow-x-auto">
          <Pagination className="flex justify-center">
            <PaginationContent className="flex flex-wrap justify-center gap-1">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={`${currentPage === 1 ? "pointer-events-none opacity-50" : ""} text-xs sm:text-sm`}
                  tabIndex={currentPage === 1 ? -1 : 0}
                />
              </PaginationItem>

              {getPageNumbers().map((page, index) =>
                page === "ellipsis" ? (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={`page-${page}`}>
                    <PaginationLink
                      isActive={currentPage === page}
                      onClick={() => handlePageChange(Number(page))}
                      className="text-xs sm:text-sm h-8 w-8 sm:h-9 sm:w-9"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={`${currentPage === totalPages ? "pointer-events-none opacity-50" : ""} text-xs sm:text-sm`}
                  tabIndex={currentPage === totalPages ? -1 : 0}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}

