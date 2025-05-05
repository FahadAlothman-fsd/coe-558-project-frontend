import { WeatherWidget } from "@/components/weather-widget"
import { ChatInterface } from "@/components/chat-interface"
import { SavedChats } from "@/components/saved-chats"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-purple-600">AI Chat with Weather</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 order-1 lg:order-1">
            <WeatherWidget />
            <div className="mt-6">
              <SavedChats />
            </div>
          </div>

          <div className="lg:col-span-8 order-2 lg:order-2">
            <ChatInterface />
          </div>
        </div>
      </div>
    </main>
  )
}
