"use client"

import { useState, useEffect } from "react"
import WeatherWidget from "@/components/weather-widget"
import ChatBox from "@/components/chat-box"
import ChatHistory from "@/components/chat-history"
import type { Chat, ResponseChat } from "@/types/chat"

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch chat history on initial load
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch("/api/chats")
        const data = await response.json() as ResponseChat[]

        const chats: Chat[] = data.map((chat) => ({
          id: chat.id,
          prompt: chat.prompt.text,
          response: chat.response.text,
          files: chat.prompt.files.map((file) => ({
            name: file.filename,
            type: file.type,
            size: 0,
            data: file.url,
          })),
          timestamp: chat.created_at,
          taskType: chat.task,
          imageUrl: chat.response.files.length > 0 ?
            {
              type: 'gcs',
              data: chat.response.files[0].url,
              filename: chat.response.files[0].filename,
              mimetype: chat.response.files[0].type,


            } : null, // Assuming no image URL for now
          model: chat.model,
        }))
        console.log(chats)

        setChats(chats)

      } catch (error) {
        console.error("Failed to fetch chats:", error)
      }
    }

    fetchChats()
  }, [])

  const addChat = (chat: Chat) => {
    setChats((prev) => [chat, ...prev])
  }

  const updateChat = (updatedChat: Chat) => {
    setChats((prev) => prev.map((chat) => (chat.id === updatedChat.id ? updatedChat : chat)))
  }

  const deleteChat = async (id: string) => {
    try {
      await fetch(`/api/chats?id=${id}`, { method: "DELETE" })
      setChats((prev) => prev.filter((chat) => chat.id !== id))
    } catch (error) {
      console.error("Failed to delete chat:", error)
    }
  }

  return (
    <main className="min-h-screen bg-pastel-cream p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl md:text-5xl font-black text-pastel-purple mb-8 p-4 border-4 border-black bg-pastel-yellow inline-block shadow-brutal">
          AI Chat
        </h1>

        <div className="grid grid-cols-1 gap-8">
          {/* Weather Widget */}
          <section className="bg-pastel-pink border-4 border-black p-4 shadow-brutal">
            <h2 className="text-2xl font-bold mb-4">Weather Widget</h2>
            <WeatherWidget />
          </section>

          {/* Chat Box */}
          <section className="bg-pastel-blue border-4 border-black p-4 shadow-brutal">
            <h2 className="text-2xl font-bold mb-4">AI Chat</h2>
            <ChatBox onChatComplete={addChat} isLoading={isLoading} setIsLoading={setIsLoading} />
          </section>

          {/* Chat History */}
          <section className="bg-pastel-green border-4 border-black p-4 shadow-brutal">
            <h2 className="text-2xl font-bold mb-4">Chat History</h2>
            <ChatHistory chats={chats} onUpdate={updateChat} onDelete={deleteChat} isLoading={isLoading} />
          </section>
        </div>
      </div>
    </main>
  )
}
