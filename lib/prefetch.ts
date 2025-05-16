import { cache } from "react"
import { prisma } from "./db"
import { getFromCache, setInCache } from "./cache"
import { logError } from "./error-utils"

// Cache time in seconds (5 minutes)
const CACHE_TIME = 300

// Prefetch and cache user data
export const prefetchUser = cache(async (userId: string) => {
  try {
    // Try to get from cache first
    const cacheKey = `user:${userId}`
    const cachedUser = await getFromCache(cacheKey)

    if (cachedUser) {
      return cachedUser
    }

    // If not in cache, fetch from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    })

    if (user) {
      // Store in cache for future use
      await setInCache(cacheKey, user, CACHE_TIME)
    }

    return user
  } catch (error) {
    logError(error, "PREFETCH_USER")
    return null
  }
})

// Prefetch and cache mass data
export const prefetchMass = cache(async (massId: string) => {
  try {
    // Try to get from cache first
    const cacheKey = `mass:${massId}`
    const cachedMass = await getFromCache(cacheKey)

    if (cachedMass) {
      return cachedMass
    }

    // If not in cache, fetch from database
    const mass = await prisma.mass.findUnique({
      where: { id: massId },
      include: {
        _count: {
          select: {
            massIntentions: true,
            thanksgivings: true,
          },
        },
      },
    })

    if (mass) {
      // Store in cache for future use
      await setInCache(cacheKey, mass, CACHE_TIME)
    }

    return mass
  } catch (error) {
    logError(error, "PREFETCH_MASS")
    return null
  }
})

// Prefetch and cache event data
export const prefetchEvent = cache(async (eventId: string) => {
  try {
    // Try to get from cache first
    const cacheKey = `event:${eventId}`
    const cachedEvent = await getFromCache(cacheKey)

    if (cachedEvent) {
      return cachedEvent
    }

    // If not in cache, fetch from database
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: {
            rsvps: true,
          },
        },
      },
    })

    if (event) {
      // Store in cache for future use
      await setInCache(cacheKey, event, CACHE_TIME)
    }

    return event
  } catch (error) {
    logError(error, "PREFETCH_EVENT")
    return null
  }
})

// Prefetch and cache payment data
export const prefetchPayment = cache(async (paymentId: string) => {
  try {
    // Try to get from cache first
    const cacheKey = `payment:${paymentId}`
    const cachedPayment = await getFromCache(cacheKey)

    if (cachedPayment) {
      return cachedPayment
    }

    // If not in cache, fetch from database
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        goal: true,
      },
    })

    if (payment) {
      // Store in cache for future use
      await setInCache(cacheKey, payment, CACHE_TIME)
    }

    return payment
  } catch (error) {
    logError(error, "PREFETCH_PAYMENT")
    return null
  }
})

// Prefetch and cache church info
export const prefetchChurchInfo = cache(async () => {
  try {
    // Try to get from cache first
    const cacheKey = "churchInfo"
    const cachedInfo = await getFromCache(cacheKey)

    if (cachedInfo) {
      return cachedInfo
    }

    // If not in cache, fetch from database
    const churchInfo = await prisma.churchInfo.findFirst()

    if (churchInfo) {
      // Store in cache for future use
      await setInCache(cacheKey, churchInfo, CACHE_TIME)
    }

    return churchInfo
  } catch (error) {
    logError(error, "PREFETCH_CHURCH_INFO")
    return null
  }
})

