"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Send, ImageIcon, Mic, Video, X, Save } from "lucide-react"
import type { Chat } from "@/types/chat"

type ChatBoxProps = {
  onChatComplete: (chat: Chat) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

type FormData = {
  prompt: string
  saveToHistory: boolean
}

export default function ChatBox({ onChatComplete, isLoading, setIsLoading }: ChatBoxProps) {
  const [response, setResponse] = useState<string>("")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [isSaved, setIsSaved] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      prompt: "",
      saveToHistory: true,
    },
  })

  const promptValue = watch("prompt")
  const saveToHistory = watch("saveToHistory")

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files)
    const totalSize = [...uploadedFiles, ...newFiles].reduce((acc, file) => acc + file.size, 0)

    // Check if total size exceeds 20MB
    if (totalSize > 20 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Total file size exceeds 20MB limit",
        variant: "destructive",
      })
      return
    }

    setUploadedFiles((prev) => [...prev, ...newFiles])
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const saveChat = async (prompt: string, response: string, files: File[]) => {
    const chatData: Omit<Chat, "id"> = {
      prompt,
      response,
      files: files.map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
      })),
      timestamp: new Date().toISOString(),
    }

    try {
      const saveResponse = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chatData),
      })

      if (saveResponse.ok) {
        const savedChat = await saveResponse.json()
        onChatComplete(savedChat)
        setIsSaved(true)
        toast({
          title: "Success",
          description: "Chat saved to history",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save chat to history",
        variant: "destructive",
      })
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("prompt", data.prompt)

      uploadedFiles.forEach((file) => {
        formData.append("files", file)
      })

      const response = await fetch("/api/prompt-gemini", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      const result = await response.json()
      setResponse(result.text)

      if (data.saveToHistory) {
        await saveChat(data.prompt, result.text, uploadedFiles)
        setIsSaved(true)
      }

      // Reset form and uploaded files
      reset()
      setUploadedFiles([])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }


  const getFileTypeIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4" />
    } else if (file.type.startsWith("audio/")) {
      return <Mic className="h-4 w-4" />
    } else if (file.type.startsWith("video/")) {
      return <Video className="h-4 w-4" />
    }
    return null
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Textarea
          {...register("prompt", { required: "Please enter a prompt" })}
          placeholder="Ask me anything..."
          className="min-h-[120px] border-3 border-black font-medium resize-y"
        />
        {errors.prompt && <p className="text-red-600 font-bold">{errors.prompt.message}</p>}

        <div className="flex flex-wrap gap-2 items-center">
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-pastel-purple hover:bg-pastel-purple/90 text-black border-3 border-black font-bold transform hover:-translate-y-1 transition-transform"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Add Image
          </Button>

          <Button
            type="button"
            onClick={() => audioInputRef.current?.click()}
            className="bg-pastel-orange hover:bg-pastel-orange/90 text-black border-3 border-black font-bold transform hover:-translate-y-1 transition-transform"
          >
            <Mic className="h-4 w-4 mr-2" />
            Add Audio
          </Button>


          <Button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="bg-pastel-blue hover:bg-pastel-blue/90 text-black border-3 border-black font-bold transform hover:-translate-y-1 transition-transform"
          >
            <Video className="h-4 w-4 mr-2" />
            Add Video
          </Button>

          <div className="flex items-center space-x-2 ml-auto">
            <Switch id="save-history" {...register("saveToHistory")} />
            <Label htmlFor="save-history" className="font-bold">
              Save to History
            </Label>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !promptValue}
            className="bg-pastel-yellow hover:bg-pastel-yellow/90 text-black border-3 border-black font-bold transform hover:-translate-y-1 transition-transform"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Submit
          </Button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
          multiple
        />

        <input
          type="file"
          ref={audioInputRef}
          onChange={handleFileUpload}
          accept="audio/*"
          className="hidden"
          multiple
        />

        <input
          type="file"
          ref={videoInputRef}
          onChange={handleFileUpload}
          accept="video/*"
          className="hidden"
          multiple
        />
      </form>

      {uploadedFiles.length > 0 && (
        <div className="border-3 border-black p-3 bg-white">
          <h3 className="font-bold mb-2">Uploaded Files ({uploadedFiles.length})</h3>
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center bg-pastel-cream p-2 border-2 border-black">
                {getFileTypeIcon(file)}
                <span className="text-sm truncate max-w-[150px] ml-1">{file.name}</span>
                <span className="text-xs ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="ml-1 h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="text-sm mt-2">
            Total: {(uploadedFiles.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024)).toFixed(2)} MB / 20 MB
          </div>
        </div>
      )}

      {response && (
        <div className="border-3 border-black p-4 bg-white shadow-brutal mt-6">
          <h3 className="font-bold mb-2">AI Response:</h3>
          <div className="whitespace-pre-wrap">
            {response}
            {response.includes("![image]") && (
              <div className="mt-4">
                <img
                  src="/placeholder.svg?key=o7je2"
                  alt="AI generated image"
                  className="border-2 border-black max-w-full h-auto"
                />
              </div>
            )}
          </div>
          {!isLoading && (
            <Button
              onClick={() => saveChat(promptValue, response, uploadedFiles)}
              className="mt-4 bg-pastel-green hover:bg-pastel-green/90 text-black border-3 border-black font-bold"
              disabled={isSaved}
            >
              Save to History
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
