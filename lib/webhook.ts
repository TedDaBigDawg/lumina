import crypto from "crypto"
import { logError } from "./error-utils"

// Secret for signing webhook payloads
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "default-webhook-secret"

// Enum for webhook event types
export enum WebhookEventType {
  PAYMENT_CREATED = "payment.created",
  PAYMENT_UPDATED = "payment.updated",
  MASS_INTENTION_CREATED = "mass_intention.created",
  MASS_INTENTION_UPDATED = "mass_intention.updated",
  THANKSGIVING_CREATED = "thanksgiving.created",
  THANKSGIVING_UPDATED = "thanksgiving.updated",
  EVENT_CREATED = "event.created",
  EVENT_UPDATED = "event.updated",
  USER_CREATED = "user.created",
  USER_UPDATED = "user.updated",
}

// Interface for webhook payload
export interface WebhookPayload {
  id: string
  event: WebhookEventType
  data: any
  createdAt: string
}

// Function to sign a webhook payload
export function signWebhookPayload(payload: WebhookPayload): string {
  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET)
  hmac.update(JSON.stringify(payload))
  return hmac.digest("hex")
}

// Function to verify a webhook signature
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  try {
    if (!WEBHOOK_SECRET) {
      console.error("Missing WEBHOOK_SECRET environment variable")
      return false
    }

    const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET)
    hmac.update(payload)
    const expectedSignature = hmac.digest("hex")
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  } catch (error) {
    console.error("Error verifying webhook signature:", error)
    return false
  }
}

// Function to create a webhook payload
export function createWebhookPayload(event: WebhookEventType, data: any): WebhookPayload {
  return {
    id: crypto.randomUUID(),
    event,
    data,
    createdAt: new Date().toISOString(),
  }
}

// Function to send a webhook
export async function sendWebhook(url: string, event: WebhookEventType, data: any): Promise<boolean> {
  try {
    const payload = createWebhookPayload(event, data)
    const signature = signWebhookPayload(payload)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
      },
      body: JSON.stringify(payload),
    })

    return response.ok
  } catch (error) {
    logError(error, "SEND_WEBHOOK")
    return false
  }
}

// Function to send webhooks to all subscribers for an event
export async function notifyWebhookSubscribers(event: WebhookEventType, data: any): Promise<void> {
  try {
    // In a real application, you would store webhook subscriptions in the database
    // For now, we'll just log the event
    console.log(`Webhook event: ${event}`, data)

    // Example of how you would send webhooks to subscribers:
    /*
    const subscribers = await prisma.webhookSubscription.findMany({
      where: {
        events: {
          has: event,
        },
        active: true,
      },
    })
    
    await Promise.all(
      subscribers.map((subscriber) =>
        sendWebhook(subscriber.url, event, data)
      )
    )
    */
  } catch (error) {
    logError(error, "NOTIFY_WEBHOOK_SUBSCRIBERS")
  }
}

