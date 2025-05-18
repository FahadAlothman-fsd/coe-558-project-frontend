import { NextResponse } from "next/server"
import type { Chat } from "@/types/chat"

// In-memory storage for demo purposes
// In a real app, you would use a database
let chats: Chat[] = [{
  "id": "1",
  "prompt": "What is the weather like today?",
  "response": "The weather is sunny with a high of 25°C.",
  "files": [],
  "timestamp": "2023-10-01T12:00:00Z",
  "taskType": "text",
},
{
  "id": "2",
  "prompt": "What is the weather like today?",
  "response": "The weather is sunny with a high of 25°C.",
  "files": [],
  "timestamp": "2023-10-01T12:00:00Z",
  "taskType": "image",
}
]

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

    const formData = await request.formData()
    const prompt = formData.get("prompt") as string
    const generatedResponse = formData.get("model") as string
    const task = (formData.get("task") as string) || "text"
    const model = formData.get("model") as string
    const files = formData.getAll("files") as File[]
    const generated_image = formData.get("generated_image") as File
    console.log("FormData received:", formData)

    const newformData = new FormData()
    newformData.append("prompt", prompt)
    newformData.append("task", task)
    newformData.append("response", generatedResponse)
    newformData.append("model", model)


    files.forEach((file) => {
      newformData.append("files", file)
      console.log(file)
    })

    if (generated_image) {
      newformData.append("image_url", generated_image)

    }

    console.log("FormData to be sent:", newformData)

    let url = " http://127.0.0.1:8000"
    // Forward the FormData directly to the API
    const response = await fetch(`${url}/api/v1/chats`, {
      method: "POST",
      body: newformData,
    })
    if (!response.ok) {
      throw new Error(`Chats API responded with status: ${response.status}`)
    }

    const savedChat = await response.json()
    return NextResponse.json(savedChat)

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
