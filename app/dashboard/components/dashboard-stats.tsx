"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Users, Calendar, BookOpen, Heart, DollarSign, RefreshCw } from "lucide-react"
import { useDataFetching } from "@/hooks/use-data-fetching"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface DashboardStatsProps {
  initialStats: {
    totalUsers: number
    totalEvents: number
    totalMassIntentions: number
    totalThanksgivings: number
    totalDonations: number
  }
  refreshInterval?: number
}

export function DashboardStats({ initialStats, refreshInterval = 60000 }: DashboardStatsProps) {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [animateStats, setAnimateStats] = useState<Record<string, boolean>>({})

  // Use our improved data fetching hook
  const {
    data: stats,
    error,
    isLoading,
    isValidating,
    refresh,
  } = useDataFetching<typeof initialStats>("/api/dashboard/stats", {
    initialData: initialStats,
    refreshInterval,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  })

  // Function to determine if a stat has changed
  const hasChanged = useCallback(
    (key: keyof typeof initialStats) => {
      return stats && initialStats && stats[key] !== initialStats[key]
    },
    [stats, initialStats],
  )

  // Update lastUpdated timestamp when data refreshes
  useEffect(() => {
    if (!isValidating && stats) {
      setLastUpdated(new Date())

      // Check which stats have changed and set animation flags
      const changes: Record<string, boolean> = {}
      Object.keys(stats).forEach((key) => {
        const typedKey = key as keyof typeof initialStats
        if (hasChanged(typedKey)) {
          changes[key] = true
        }
      })

      if (Object.keys(changes).length > 0) {
        setAnimateStats(changes)
        // Reset animation flags after animation completes
        setTimeout(() => setAnimateStats({}), 2000)
      }
    }
  }, [isValidating, stats, hasChanged])

  // Format the last updated time
  const formattedLastUpdated = lastUpdated.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">Last updated: {formattedLastUpdated}</div>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={isValidating}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-3 w-3 ${isValidating ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className={`transition-all duration-300 ${animateStats["totalUsers"] ? "bg-blue-50" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <motion.div
              className="text-2xl font-bold"
              animate={animateStats["totalUsers"] ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              {stats?.totalUsers || 0}
            </motion.div>
            {isValidating && (
              <div className="text-xs text-gray-500 mt-1 flex items-center">
                <div className="animate-spin rounded-full h-2 w-2 border-t-1 border-b-1 border-gray-500 mr-1"></div>
                Updating...
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={`transition-all duration-300 ${animateStats["totalEvents"] ? "bg-blue-50" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <motion.div
              className="text-2xl font-bold"
              animate={animateStats["totalEvents"] ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              {stats?.totalEvents || 0}
            </motion.div>
            {isValidating && (
              <div className="text-xs text-gray-500 mt-1 flex items-center">
                <div className="animate-spin rounded-full h-2 w-2 border-t-1 border-b-1 border-gray-500 mr-1"></div>
                Updating...
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={`transition-all duration-300 ${animateStats["totalMassIntentions"] ? "bg-blue-50" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mass Intentions</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <motion.div
              className="text-2xl font-bold"
              animate={animateStats["totalMassIntentions"] ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              {stats?.totalMassIntentions || 0}
            </motion.div>
            {isValidating && (
              <div className="text-xs text-gray-500 mt-1 flex items-center">
                <div className="animate-spin rounded-full h-2 w-2 border-t-1 border-b-1 border-gray-500 mr-1"></div>
                Updating...
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={`transition-all duration-300 ${animateStats["totalThanksgivings"] ? "bg-blue-50" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Thanksgivings</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <motion.div
              className="text-2xl font-bold"
              animate={animateStats["totalThanksgivings"] ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              {stats?.totalThanksgivings || 0}
            </motion.div>
            {isValidating && (
              <div className="text-xs text-gray-500 mt-1 flex items-center">
                <div className="animate-spin rounded-full h-2 w-2 border-t-1 border-b-1 border-gray-500 mr-1"></div>
                Updating...
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={`transition-all duration-300 ${animateStats["totalDonations"] ? "bg-blue-50" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <motion.div
              className="text-2xl font-bold"
              animate={animateStats["totalDonations"] ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              {formatCurrency(stats?.totalDonations || 0)}
            </motion.div>
            {isValidating && (
              <div className="text-xs text-gray-500 mt-1 flex items-center">
                <div className="animate-spin rounded-full h-2 w-2 border-t-1 border-b-1 border-gray-500 mr-1"></div>
                Updating...
              </div>
            )}
            {error && <p className="text-xs text-red-500 mt-1">Error updating stats</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

