export type FileInfo = {
  name: string
  type: string
  size: number
}

export type ImageSource = {
  type: "base64" | "gcs" | "url"
  data: string
}

export type TaskType = "text" | "image"

export type Chat = {
  id: string
  prompt: string
  response: string
  files?: FileInfo[]
  timestamp: string
  taskType?: TaskType
  imageUrl?: string | null
  model?: string
}
