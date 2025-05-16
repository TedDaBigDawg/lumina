import crypto from "crypto"

// Paystack API base URL
const PAYSTACK_BASE_URL = "https://api.paystack.co"

// Paystack API key from environment variables
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || ""

// Function to initialize a transaction
export async function initializeTransaction(
  email: string,
  amount: number,
  reference: string,
  metadata: Record<string, any> = {},
) {
  try {
    // Amount should be in kobo (multiply by 100)
    const amountInKobo = Math.round(amount * 100)

    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amountInKobo,
        reference,
        metadata,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/verify`,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to initialize transaction")
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error("Error initializing Paystack transaction:", error)
    throw error
  }
}

// Function to verify a transaction
export async function verifyTransaction(reference: string) {
  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to verify transaction")
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error("Error verifying Paystack transaction:", error)
    throw error
  }
}

// Function to validate Paystack webhook
export function validateWebhook(requestBody: any, paystackSignature: string) {
  if (!PAYSTACK_SECRET_KEY) {
    console.error("Missing PAYSTACK_SECRET_KEY environment variable")
    return false
  }

  const hash = crypto.createHmac("sha512", PAYSTACK_SECRET_KEY).update(JSON.stringify(requestBody)).digest("hex")

  return hash === paystackSignature
}

