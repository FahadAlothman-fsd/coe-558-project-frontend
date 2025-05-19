export type FileInfo = {
  name: string
  type: string
  size: number
  url?: string
}

export type ImageSource = {
  type: "gcs" | "url"
  data: string
  filename?: string
  mimetype?: string
} | {

  type: "base64"
  data: {
    url: string
    blob: Blob
  }
}

export type TaskType = "text" | "image"

export type Chat = {
  id: string
  prompt: string
  response: string
  files?: FileInfo[]
  timestamp: string
  taskType?: TaskType
  imageUrl?: ImageSource | null
  model?: string
}


export type ResponseChat = {

  id: string
  prompt: {
    text: string
    files: {
      filename: string
      url: string
      type: string

    }[]
  }
  response: {
    text: string
    files: {
      filename: string
      url: string
      type: string

    }[]

  }
  created_at: string
  updated_at: string
  task: TaskType
  model: string
}
