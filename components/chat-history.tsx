"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Loader2, Edit, Trash2, ImageIcon, Mic, ChevronDown, ChevronUp, Save, X } from "lucide-react"
import type { Chat } from "@/types/chat"
import { formatDistanceToNow } from "date-fns"

type ChatHistoryProps = {
  chats: Chat[]
  onUpdate: (chat: Chat) => void
  onDelete: (id: string) => void
  isLoading: boolean
}

export default function ChatHistory({ chats, onUpdate, onDelete, isLoading }: ChatHistoryProps) {
  const [expandedChatId, setExpandedChatId] = useState<string | null>(null)
  const [editingChatId, setEditingChatId] = useState<string | null>(null)

  const { register, handleSubmit, reset } = useForm<{ prompt: string }>()

  const toggleExpand = (id: string) => {
    setExpandedChatId((prev) => (prev === id ? null : id))
  }

  const startEditing = (chat: Chat) => {
    setEditingChatId(chat.id)
    reset({ prompt: chat.prompt })
  }

  const cancelEditing = () => {
    setEditingChatId(null)
  }

  const submitEdit = async (data: { prompt: string }) => {
    if (!editingChatId) return

    const chatToUpdate = chats.find((chat) => chat.id === editingChatId)
    if (!chatToUpdate) return

    try {
      // First, get a new response from the AI
      const formData = new FormData()
      formData.append("prompt", data.prompt)

      // If the chat had files, we would need to handle them here
      // For now, we'll just note that in the response
      const filesNote =
        chatToUpdate.files && chatToUpdate.files.length > 0
          ? "\n\n(Note: This is a regenerated response. The original had attached files that were not reprocessed.)"
          : ""

      const aiResponse = await fetch("/api/prompt-gemini", {
        method: "POST",
        body: formData,
      })

      if (!aiResponse.ok) {
        throw new Error("Failed to get AI response")
      }

      const result = await aiResponse.json()
      const newResponse = result.text + filesNote

      // Then update the chat with both the new prompt and response
      const response = await fetch(`/api/chats?id=${editingChatId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...chatToUpdate,
          prompt: data.prompt,
          response: newResponse,
        }),
      })

      if (response.ok) {
        const updatedChat = await response.json()
        onUpdate(updatedChat)
      }
    } catch (error) {
      console.error("Failed to update chat:", error)
    } finally {
      setEditingChatId(null)
    }
  }

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this chat?")) {
      onDelete(id)
    }
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4" />
    } else if (type.startsWith("audio/")) {
      return <Mic className="h-4 w-4" />
    }
    return null
  }

  if (chats.length === 0) {
    return (
      <div className="text-center p-8 border-3 border-black bg-white">
        <p className="font-bold">No chat history yet</p>
        <p className="text-sm mt-2">Your conversations will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
      {chats.map((chat) => (
        <Card
          key={chat.id}
          className={`border-3 border-black p-4 ${
            expandedChatId === chat.id ? "bg-pastel-cream" : "bg-white"
          } shadow-brutal`}
        >
          {editingChatId === chat.id ? (
            <form onSubmit={handleSubmit(submitEdit)} className="space-y-3">
              <Textarea {...register("prompt", { required: true })} className="border-3 border-black font-medium" />
              <div className="flex space-x-2">
                <Button
                  type="submit"
                  className="bg-pastel-green hover:bg-pastel-green/90 text-black border-3 border-black font-bold"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button
                  type="button"
                  onClick={cancelEditing}
                  className="bg-pastel-red hover:bg-pastel-red/90 text-black border-3 border-black font-bold"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-bold line-clamp-2">{chat.prompt}</p>

                  {chat.files && chat.files.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {chat.files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center bg-pastel-cream p-1 border-2 border-black text-xs"
                        >
                          {getFileIcon(file.type)}
                          <span className="ml-1 truncate max-w-[100px]">{file.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-sm text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(chat.timestamp), { addSuffix: true })}
                  </p>
                </div>

                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEditing(chat)}
                    className="h-8 w-8 p-0 hover:bg-pastel-yellow border-2 border-black"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(chat.id)}
                    className="h-8 w-8 p-0 hover:bg-pastel-red border-2 border-black"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleExpand(chat.id)}
                    className="h-8 w-8 p-0 hover:bg-pastel-blue border-2 border-black"
                  >
                    {expandedChatId === chat.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {expandedChatId === chat.id && (
                <div className="mt-4 border-t-2 border-black pt-3">
                  <h4 className="font-bold mb-2">Response:</h4>
                  <div className="whitespace-pre-wrap">
                    {chat.response.includes("![image]") ? (
                      <>
                        {chat.response.split("![image]").map((part, index) => (
                          <div key={index}>
                            {part}
                            {index < chat.response.split("![image]").length - 1 && (
                              <img
                                src="/placeholder.svg?key=bthjh"
                                alt="AI generated image"
                                className="my-2 border-2 border-black max-w-full h-auto"
                              />
                            )}
                          </div>
                        ))}
                      </>
                    ) : (
                      chat.response
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      ))}

      {isLoading && (
        <div className="flex justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
    </div>
  )
}
