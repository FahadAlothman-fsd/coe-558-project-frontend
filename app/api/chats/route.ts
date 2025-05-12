import { NextResponse } from "next/server"
import type { Chat } from "@/types/chat"

// In-memory storage for demo purposes
// In a real app, you would use a database
let chats: Chat[] = []

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (id) {
    const chat = chats.find((c) => c.id === id)
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }
    return NextResponse.json(chat)
  }

  return NextResponse.json(chats)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const newChat: Chat = {
      id: Date.now().toString(),
      prompt: body.prompt,
      response: body.response,
      files: body.files,
      timestamp: body.timestamp || new Date().toISOString(),
    }

    chats.unshift(newChat) // Add to beginning of array

    return NextResponse.json(newChat)
  } catch (error) {
    console.error("Create chat error:", error)
    return NextResponse.json({ error: "Failed to create chat" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Chat ID is required" }, { status: 400 })
    }

    const body = await request.json()
    const chatIndex = chats.findIndex((c) => c.id === id)

    if (chatIndex === -1) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    const updatedChat = {
      ...chats[chatIndex],
      ...body,
    }

    chats[chatIndex] = updatedChat

    return NextResponse.json(updatedChat)
  } catch (error) {
    console.error("Update chat error:", error)
    return NextResponse.json({ error: "Failed to update chat" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Chat ID is required" }, { status: 400 })
  }

  const initialLength = chats.length
  chats = chats.filter((c) => c.id !== id)

  if (chats.length === initialLength) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
