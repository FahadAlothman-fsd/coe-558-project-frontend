"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Cloud, CloudRain, Search, Sun, MapPin, Thermometer, Wind, Snowflake } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface WeatherData {
  location: string
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
}

export function WeatherWidget() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCelsius, setIsCelsius] = useState(true)
  const [searchLocation, setSearchLocation] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    // Get user's location on component mount
    getUserLocation()
  }, [])

  const getUserLocation = () => {
    setLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherData(`${position.coords.latitude},${position.coords.longitude}`)
        },
        (error) => {
          console.error("Error getting location:", error)
          // Fallback to IP-based location
          fetchWeatherData("auto:ip")
          toast({
            title: "Location access denied",
            description: "Using approximate location based on IP address",
            variant: "destructive",
          })
        },
      )
    } else {
      // Fallback to IP-based location
      fetchWeatherData("auto:ip")
      toast({
        title: "Geolocation not supported",
        description: "Using approximate location based on IP address",
      })
    }
  }

  const fetchWeatherData = async (location: string) => {
    try {
      setLoading(true)
      // In a real app, this would be a call to your API gateway
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/weather?location=${encodeURIComponent(location)}`,
      )

      // For demo purposes, we'll simulate a response
      // const data = await response.json()

      // Simulated data
      const mockData: WeatherData = {
        location: location === "auto:ip" ? "Current Location" : location,
        temperature: 22,
        condition: ["Sunny", "Cloudy", "Rainy", "Snowy"][Math.floor(Math.random() * 4)],
        humidity: 65,
        windSpeed: 12,
      }

      setWeatherData(mockData)
    } catch (error) {
      console.error("Error fetching weather data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch weather data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchLocation.trim()) {
      fetchWeatherData(searchLocation.trim())
    }
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "sunny":
        return <Sun className="h-12 w-12 text-yellow-400" />
      case "cloudy":
        return <Cloud className="h-12 w-12 text-gray-400" />
      case "rainy":
        return <CloudRain className="h-12 w-12 text-blue-400" />
      case "snowy":
        return <Snowflake className="h-12 w-12 text-blue-200" />
      default:
        return <Sun className="h-12 w-12 text-yellow-400" />
    }
  }

  const convertTemperature = (temp: number) => {
    if (isCelsius) {
      return temp
    } else {
      return Math.round((temp * 9) / 5 + 32)
    }
  }

  return (
    <Card className="overflow-hidden border-2 border-purple-200 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="text-purple-700">Weather</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={getUserLocation}
            className="text-purple-700 hover:text-purple-900 hover:bg-purple-100"
          >
            <MapPin className="h-4 w-4 mr-1" />
            My Location
          </Button>
        </CardTitle>
        <form onSubmit={handleSearch} className="flex gap-2 mt-2">
          <Input
            placeholder="Search location..."
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="border-purple-200 focus-visible:ring-purple-400"
          />
          <Button type="submit" size="sm" className="bg-purple-500 hover:bg-purple-600 text-white">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </CardHeader>
      <CardContent className="pt-4">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : weatherData ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-700">{weatherData.location}</h3>
                <Tabs defaultValue="celsius" className="w-full mt-2">
                  <TabsList className="bg-purple-100">
                    <TabsTrigger
                      value="celsius"
                      onClick={() => setIsCelsius(true)}
                      className="data-[state=active]:bg-purple-200"
                    >
                      °C
                    </TabsTrigger>
                    <TabsTrigger
                      value="fahrenheit"
                      onClick={() => setIsCelsius(false)}
                      className="data-[state=active]:bg-purple-200"
                    >
                      °F
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="flex flex-col items-center">
                {getWeatherIcon(weatherData.condition)}
                <span className="text-sm text-gray-600 mt-1">{weatherData.condition}</span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-purple-50 p-3 rounded-lg">
              <div className="flex items-center">
                <Thermometer className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-gray-700">Temperature</span>
              </div>
              <span className="text-xl font-bold text-purple-700">
                {convertTemperature(weatherData.temperature)}°{isCelsius ? "C" : "F"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center">
                  <Wind className="h-4 w-4 text-blue-400 mr-2" />
                  <span className="text-sm text-gray-700">Wind</span>
                </div>
                <span className="text-lg font-medium text-gray-800">{weatherData.windSpeed} km/h</span>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center">
                  <Cloud className="h-4 w-4 text-blue-400 mr-2" />
                  <span className="text-sm text-gray-700">Humidity</span>
                </div>
                <span className="text-lg font-medium text-gray-800">{weatherData.humidity}%</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">No weather data available</div>
        )}
      </CardContent>
    </Card>
  )
}
