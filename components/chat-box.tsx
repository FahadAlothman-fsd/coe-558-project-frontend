"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Send, ImageIcon, Mic, Video, X, Save, FileText, Cpu } from "lucide-react"
import type { Chat, ImageSource, ResponseChat } from "@/types/chat"
import { createImageSource, getImageSrc } from "@/lib/utils"

type ChatBoxProps = {
  onChatComplete: (chat: Chat) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

type TaskType = "text" | "image"

type FormData = {
  prompt: string
  saveToHistory: boolean
  task: TaskType
}

export default function ChatBox({ onChatComplete, isLoading, setIsLoading }: ChatBoxProps) {
  const [response, setResponse] = useState<string>("")
  const [prevResponse, setPrevResponse] = useState<string>("")
  const [isSavingChat, setIsSavingChat] = useState<boolean>(false)

  const [responseImage, setResponseImage] = useState<ImageSource | null>(null)
  const [prevResponseImage, setPrevResponseImage] = useState<ImageSource | null>(null)

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [prevUploadedFiles, setPrevUploadedFiles] = useState<File[]>([])

  const [currentPrompt, setCurrentPrompt] = useState<string>("")
  const [prevPrompt, setPrevPrompt] = useState<string>("")
  const [model, setModel] = useState<string>("")

  const [taskType, setTaskType] = useState<TaskType>("text")
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
    control,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      prompt: "",
      saveToHistory: false,
    },
  })

  const promptValue = watch("prompt")


  // Reset isSaved when prompt changes
  useEffect(() => {
    if (promptValue) {
      setIsSaved(false)
    }
  }, [promptValue])


  const handleTaskChange = (value: TaskType) => {
    setTaskType(value)
    setValue("task", value) // Update the form value
  }

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

  const saveChat = async (prompt: string, response: string, files: File[], imageUrl: ImageSource | null = null, model = "") => {
    setIsSavingChat(true)
    const chatData: Omit<Chat, "id"> = {
      prompt,
      response,
      files: files.map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        file: file.name,
      })),
      timestamp: new Date().toISOString(),
      taskType,
      imageUrl,
      model,
    }
    console.log(chatData)

    const formData = new FormData()
    formData.append("prompt", prompt)
    formData.append("task", taskType)
    formData.append("response", response)
    formData.append("model", model)

    files.forEach((file) => {
      formData.append("files", file)
    })

    if (imageUrl && imageUrl.type === 'base64') {
      formData.append("generated_image", imageUrl.data.blob)

    }

    try {

      const saveResponse = await fetch("/api/chats", {
        method: "POST",
        body: formData,
      })

      if (saveResponse.ok) {
        const savedChat = await saveResponse.json() as ResponseChat
        const chat: Chat = {
          id: savedChat.id,
          prompt: savedChat.prompt.text,
          response: savedChat.response.text,
          files: savedChat.prompt.files.map((file) => ({
            name: file.filename,
            type: file.type,
            size: 0,
            data: file.url,
          })),
          timestamp: savedChat.created_at,
          taskType: savedChat.task,
          imageUrl: savedChat.response.files.length > 0 ?
            {
              type: 'gcs',
              data: savedChat.response.files[0].url,
              filename: savedChat.response.files[0].filename,
              mimetype: savedChat.response.files[0].type,


            } : null, // Assuming no image URL for now
          model: savedChat.model,
        }

        onChatComplete(chat)
        // Reset Prev Image
        // Reset Prev files
        // Reset Prompt
        // Reset Response

        setPrevUploadedFiles([])
        setPrevResponse("")
        setPrevResponseImage(null)
        setPrevPrompt("")


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
    finally {

      setIsSavingChat(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setIsSaved(false)
    setResponseImage(null) // Reset any previous image
    setResponse("") // Reset any previous response
    setModel("") // Reset model information

    setPrevUploadedFiles([]) // Reset previous uploaded files

    try {
      console.log(data)
      const formData = new FormData()
      formData.append("prompt", data.prompt)
      formData.append("task", taskType)

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
      console.log(result)

      setModel(result.model || "")

      if (taskType === "image") {
        console.log("in retreving image")
        setResponse(result.text)
        setResponseImage(createImageSource(result.imageData, result.mimeType))
        setModel(result.model)
      } else {
        setResponse(result.text)
        setModel(result.model)
      }

      if (data.saveToHistory) {
        await saveChat(
          data.prompt,
          taskType === "image" ? result.text : result.text,
          uploadedFiles,
          taskType === "image" ? result.imageUrl || "/placeholder.svg?key=generated-image&width=512&height=512" : null,
          result.model || "",
        )
        setIsSaved(true)
      } else {
        console.log(result.text)
        setPrevPrompt(data.prompt)
        setPrevUploadedFiles(uploadedFiles)
        if (taskType === "image") {
          setPrevResponseImage(createImageSource(result.imageData, result.mimeType))
        }
        setPrevResponse(result.text)
        console.log("prevResponse", prevResponse)


      }

      // Reset form and uploaded files
      reset({
        prompt: "",
        saveToHistory: data.saveToHistory, // Preserve the saveToHistory value
        task: data.task,
      })
      setUploadedFiles([])

    } catch (error) {
      console.log(error)
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
      <div className="mb-4">
        <Label htmlFor="task-select" className="font-bold mb-2 block">
          Select Task
        </Label>
        <Select defaultValue="text" onValueChange={(value) => handleTaskChange(value as TaskType)}>
          <SelectTrigger className="border-3 border-black bg-white font-medium">
            <SelectValue placeholder="Select a task" />
          </SelectTrigger>
          <SelectContent className="border-3 border-black">
            <SelectItem value="text" className="font-medium">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Text Generation
              </div>
            </SelectItem>
            <SelectItem value="image" className="font-medium">
              <div className="flex items-center">
                <ImageIcon className="h-4 w-4 mr-2" />
                Image Generation
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Textarea
          {...register("prompt", { required: "Please enter a prompt" })}
          placeholder={
            taskType === "image"
              ? "Describe the image you want to generate... You can also upload reference images, audio, or video."
              : "Ask me anything..."
          }
          className="min-h-[120px] border-3 border-black font-medium resize-y"
        />
        {errors.prompt && <p className="text-red-600 font-bold">{errors.prompt.message}</p>}

        <div className="flex flex-wrap gap-2 items-center">
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-pastel-purple hover:bg-pastel-purple/90 text-black border-3 border-black font-bold transform hover:-translate-y-1 transition-transform"
            disabled={isLoading || isSavingChat}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            {taskType === "image" ? "Add Reference Image" : "Add Image"}
          </Button>

          <Button
            type="button"
            onClick={() => audioInputRef.current?.click()}
            className="bg-pastel-orange hover:bg-pastel-orange/90 text-black border-3 border-black font-bold transform hover:-translate-y-1 transition-transform"
            disabled={isLoading || isSavingChat}
          >
            <Mic className="h-4 w-4 mr-2" />
            {taskType === "image" ? "Add Reference Audio" : "Add Audio"}
          </Button>


          <Button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="bg-pastel-blue hover:bg-pastel-blue/90 text-black border-3 border-black font-bold transform hover:-translate-y-1 transition-transform"
            disabled={isLoading || isSavingChat}
          >
            <Video className="h-4 w-4 mr-2" />
            {taskType === "image" ? "Add Reference Video" : "Add Video"}
          </Button>

          <div className="flex items-center space-x-2 ml-auto">
            <Controller
              name="saveToHistory"
              control={control}
              render={({ field }) => (
                <Switch
                  id="save-history"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-pastel-green"
                  disabled
                />
              )}
            />
            <Label htmlFor="save-history" className="font-bold">
              Save to History
            </Label>
          </div>

          <Button
            type="submit"
            disabled={isLoading || isSavingChat || !promptValue}
            className="bg-pastel-yellow hover:bg-pastel-yellow/90 text-black border-3 border-black font-bold transform hover:-translate-y-1 transition-transform"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            {taskType === "image" ? "Generate Image" : "Submit"}
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
          <h3 className="font-bold mb-2">{taskType === "image" ? "Reference Files" : "Uploaded Files"} ({uploadedFiles.length})</h3>
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

      {(response || responseImage) && (
        <div className="border-3 border-black p-4 bg-white shadow-brutal mt-6">
          <div className="flex items-center mb-4">
            <h3 className="font-bold text-xl">AI Response:</h3>
            {model && (
              <div className="flex items-center ml-3 bg-pastel-purple px-3 py-1 border-3 border-black rounded-md">
                <Cpu className="h-5 w-5 mr-2" />
                <span className="font-bold text-xl">{model}</span>
              </div>
            )}
          </div>

          {taskType === "image" && responseImage ? (
            <div className="flex flex-col items-center">
              <p className="mb-3">{response}</p>
              <img
                src={getImageSrc(responseImage) || "/placeholder.svg"}
                alt="AI generated image"
                className="border-3 border-black max-w-full h-auto"
              />
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <MarkdownRenderer content={response} />
            </div>
          )}

          {!isSaved && !isLoading && (
            <Button
              onClick={() =>
                saveChat(prevPrompt, prevResponse, prevUploadedFiles, prevResponseImage, model)
              }
              className="mt-4 bg-pastel-green hover:bg-pastel-green/90 text-black border-3 border-black font-bold"
              disabled={isSavingChat}
            >

              {isSavingChat ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save to History
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
