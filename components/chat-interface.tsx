"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Send, ImageIcon, Mic, Save, Loader2, Bot, User } from "lucide-react"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  type: "text" | "image" | "audio"
  mediaUrl?: string
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!input.trim() && !fileInputRef.current?.files?.length && !audioInputRef.current?.files?.length) return

    try {
      // Create user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: input,
        timestamp: new Date(),
        type: "text",
      }

      setMessages((prev) => [...prev, userMessage])
      setInput("")
      setIsLoading(true)

      // In a real app, this would be a call to your API gateway
      // For demo purposes, we'll use the AI SDK directly
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: input || "Hello",
      })

      // Create assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: text,
        timestamp: new Date(),
        type: "text",
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleImageUpload = () => {
    fileInputRef.current?.click()
  }

  const handleAudioUpload = () => {
    audioInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "audio") => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // In a real app, you would upload the file to your API gateway
      // For demo purposes, we'll create a local URL
      const mediaUrl = URL.createObjectURL(file)

      // Create user message with media
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: type === "image" ? "Sent an image" : "Sent an audio message",
        timestamp: new Date(),
        type,
        mediaUrl,
      }

      setMessages((prev) => [...prev, userMessage])
      setIsLoading(true)

      // Simulate AI response
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            type === "image"
              ? "I've received your image. It looks interesting!"
              : "I've received your audio message. Let me process that.",
          timestamp: new Date(),
          type: "text",
        }

        setMessages((prev) => [...prev, assistantMessage])
        setIsLoading(false)
      }, 1500)
    } catch (error) {
      console.error(`Error processing ${type}:`, error)
      toast({
        title: "Error",
        description: `Failed to process ${type}. Please try again.`,
        variant: "destructive",
      })
      setIsLoading(false)
    }

    // Reset the file input
    e.target.value = ""
  }

  const saveCurrentChat = async () => {
    if (messages.length === 0) {
      toast({
        title: "Nothing to save",
        description: "Start a conversation first",
      })
      return
    }

    try {
      setIsSaving(true)

      // In a real app, this would be a call to your API gateway
      // For demo purposes, we'll simulate a successful save
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Success",
        description: "Chat saved successfully",
      })
    } catch (error) {
      console.error("Error saving chat:", error)
      toast({
        title: "Error",
        description: "Failed to save chat. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const renderMessageContent = (message: Message) => {
    if (message.type === "text") {
      return <p className="whitespace-pre-wrap">{message.content}</p>
    } else if (message.type === "image" && message.mediaUrl) {
      return (
        <div>
          <p className="mb-2">{message.content}</p>
          <img
            src={message.mediaUrl || "/placeholder.svg"}
            alt="User uploaded image"
            className="max-w-full rounded-md max-h-60 object-contain"
          />
        </div>
      )
    } else if (message.type === "audio" && message.mediaUrl) {
      return (
        <div>
          <p className="mb-2">{message.content}</p>
          <audio controls className="w-full">
            <source src={message.mediaUrl} />
            Your browser does not support the audio element.
          </audio>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="h-[calc(100vh-8rem)] flex flex-col border-2 border-purple-200 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="text-purple-700">AI Chat</span>
          <Button
            variant="outline"
            size="sm"
            onClick={saveCurrentChat}
            disabled={isSaving || messages.length === 0}
            className="border-purple-300 text-purple-700 hover:bg-purple-100"
          >
            {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            Save Chat
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <Bot className="h-16 w-16 text-purple-200 mb-4" />
            <h3 className="text-xl font-medium text-gray-700">Start a Conversation</h3>
            <p className="text-gray-500 mt-2 max-w-md">
              Send a message, image, or audio to begin chatting with the AI assistant.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <Avatar className={message.role === "assistant" ? "bg-purple-100" : "bg-pink-100"}>
                  <AvatarFallback>
                    {message.role === "assistant" ? (
                      <Bot className="h-5 w-5 text-purple-500" />
                    ) : (
                      <User className="h-5 w-5 text-pink-500" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`rounded-lg p-3 ${
                    message.role === "assistant" ? "bg-purple-100 text-gray-800" : "bg-pink-100 text-gray-800"
                  }`}
                >
                  {renderMessageContent(message)}
                  <div className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[80%]">
              <Avatar className="bg-purple-100">
                <AvatarFallback>
                  <Bot className="h-5 w-5 text-purple-500" />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-lg p-4 bg-purple-100">
                <div className="flex space-x-2">
                  <div
                    className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      <CardFooter className="p-4 border-t bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-end gap-2 w-full">
          <Button
            variant="outline"
            size="icon"
            onClick={handleImageUpload}
            disabled={isLoading}
            className="rounded-full h-10 w-10 border-purple-300 text-purple-700 hover:bg-purple-100"
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileChange(e, "image")}
            accept="image/*"
            className="hidden"
          />

          <Button
            variant="outline"
            size="icon"
            onClick={handleAudioUpload}
            disabled={isLoading}
            className="rounded-full h-10 w-10 border-purple-300 text-purple-700 hover:bg-purple-100"
          >
            <Mic className="h-5 w-5" />
          </Button>
          <input
            type="file"
            ref={audioInputRef}
            onChange={(e) => handleFileChange(e, "audio")}
            accept="audio/*"
            className="hidden"
          />

          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={isLoading}
            className="min-h-10 resize-none border-purple-200 focus-visible:ring-purple-400"
          />

          <Button
            onClick={handleSendMessage}
            disabled={
              isLoading ||
              (!input.trim() && !fileInputRef.current?.files?.length && !audioInputRef.current?.files?.length)
            }
            className="rounded-full h-10 w-10 bg-purple-500 hover:bg-purple-600 text-white"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
