export type FileInfo = {
  name: string
  type: string
  size: number
}

export type Chat = {
  id: string
  prompt: string
  response: string
  files?: FileInfo[]
  timestamp: string
}
