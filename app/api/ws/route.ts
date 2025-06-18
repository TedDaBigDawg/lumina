import type { NextRequest } from "next/server"
import { WebSocketServer } from "ws"
import { getSession } from "@/lib/auth"

// Global WebSocket server instance
let wss: WebSocketServer | null = null

// Initialize WebSocket server if it doesn't exist
function getWebSocketServer() {
  if (wss === null && typeof process !== "undefined") {
    wss = new WebSocketServer({ noServer: true })

    wss.on("connection", (ws: any) => {
      ws.on("message", (message: any) => {
        console.log("Received message:", message.toString())
      })

      ws.on("close", () => {
        console.log("Client disconnected")
      })
    })
  }

  return wss
}

export async function GET(req: NextRequest) {
  const session = await getSession()

  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  // This is a WebSocket upgrade request
  if (req.headers.get("upgrade") !== "websocket") {
    return new Response("Expected WebSocket", { status: 400 })
  }

  const wss = getWebSocketServer()

  if (!wss) {
    return new Response("WebSocket server not initialized", { status: 500 })
  }

  // @ts-ignore - NextJS doesn't have proper types for this yet
  const { socket, response } = await req.socket.server.upgrade(req)

  // Add user info to the socket
  wss.handleUpgrade(req, socket, Buffer.alloc(0), (ws) => {
    // @ts-ignore
    ws.userId = session.user.id
    // @ts-ignore
    ws.userRole = session.user.role

    wss.emit("connection", ws, req)
  })

  return response
}

// Function to broadcast a message to all connected clients
export function broadcastMessage(type: string, data: any, filter?: (userId: string, userRole: string) => boolean) {
  const server = getWebSocketServer()

  if (!server) return

  const message = JSON.stringify({ type, data })

  server.clients.forEach((client) => {
    // @ts-ignore
    const userId = client.userId
    // @ts-ignore
    const userRole = client.userRole

    if (client.readyState === WebSocket.OPEN && (!filter || filter(userId, userRole))) {
      client.send(message)
    }
  })
}

