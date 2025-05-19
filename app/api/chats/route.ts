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

  try {

    let url = " http://127.0.0.1:8000"
    // Forward the FormData directly to the API
    const response = await fetch(`${url}/api/v1/chats`, {
      method: "GET",
    })

    if (!response.ok) {
      throw new Error(`Chats API responded with status: ${response.status}`)
    }

    const all_chats = await response.json()


    console.log(all_chats)
    return NextResponse.json(all_chats)

  } catch (error) {
    return NextResponse.json({ error: "Failed to read chats" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {

    const formData = await request.formData()
    const prompt = formData.get("prompt") as string
    const generatedResponse = formData.get("response") as string
    const task = (formData.get("task") as string) || "text"
    const model = formData.get("model") as string
    const files = formData.getAll("files") as File[]
    const generated_image = formData.get("generated_image") as File

    const newformData = new FormData()
    newformData.append("prompt", prompt)
    newformData.append("task", task)
    newformData.append("response", generatedResponse)
    newformData.append("model", model)


    files.forEach((file) => {
      newformData.append("files", file)
    })

    if (generated_image) {
      newformData.append("generated_image", generated_image)

    }


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
