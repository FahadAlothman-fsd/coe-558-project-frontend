"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, MessageSquare, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface SavedChat {
  id: string
  title: string
  preview: string
  date: Date
}

export function SavedChats() {
  const [savedChats, setSavedChats] = useState<SavedChat[]>([])
  const [isOpen, setIsOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [chatToDelete, setChatToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchSavedChats()
  }, [])

  const fetchSavedChats = async () => {
    try {
      setIsLoading(true)

      // In a real app, this would be a call to your API gateway
      // For demo purposes, we'll simulate a response
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock data
      const mockChats: SavedChat[] = [
        {
          id: "1",
          title: "Weather in Tokyo",
          preview: "I asked about the weather in Tokyo and got information about...",
          date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        },
        {
          id: "2",
          title: "Recipe recommendations",
          preview: "The AI suggested some vegetarian recipes that I could...",
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        },
        {
          id: "3",
          title: "Travel planning",
          preview: "We discussed options for a weekend trip to the mountains...",
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        },
      ]

      setSavedChats(mockChats)
    } catch (error) {
      console.error("Error fetching saved chats:", error)
      toast({
        title: "Error",
        description: "Failed to load saved chats. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteChat = async (id: string) => {
    try {
      // In a real app, this would be a call to your API gateway
      // For demo purposes, we'll simulate a successful deletion
      await new Promise((resolve) => setTimeout(resolve, 500))

      setSavedChats((prev) => prev.filter((chat) => chat.id !== id))
      toast({
        title: "Success",
        description: "Chat deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting chat:", error)
      toast({
        title: "Error",
        description: "Failed to delete chat. Please try again.",
        variant: "destructive",
      })
    } finally {
      setChatToDelete(null)
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return "Today"
    } else if (diffInDays === 1) {
      return "Yesterday"
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <>
      <Card className="border-2 border-purple-200 shadow-md bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 pb-2">
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <CardTitle className="flex items-center justify-between cursor-pointer">
                <span className="text-purple-700">Saved Chats</span>
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-purple-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-purple-500" />
                )}
              </CardTitle>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-4 px-2">
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
                  </div>
                ) : savedChats.length > 0 ? (
                  <ul className="space-y-3">
                    {savedChats.map((chat) => (
                      <li key={chat.id} className="bg-purple-50 rounded-lg p-3 relative">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-purple-700">{chat.title}</h4>
                            <p className="text-sm text-gray-600 line-clamp-2">{chat.preview}</p>
                            <span className="text-xs text-gray-500 mt-1 block">{formatDate(chat.date)}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setChatToDelete(chat.id)}
                            className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-red-50 absolute top-2 right-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-10 w-10 text-purple-200 mx-auto mb-2" />
                    <p className="text-gray-500">No saved chats yet</p>
                    <p className="text-sm text-gray-400">Your saved conversations will appear here</p>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </CardHeader>
      </Card>

      <AlertDialog open={!!chatToDelete} onOpenChange={() => setChatToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this saved chat.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => chatToDelete && handleDeleteChat(chatToDelete)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
