"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Search, MapPin, Cloud, Sun, CloudRain, CloudSnow, CloudLightning } from "lucide-react"

type WeatherFormData = {
  city: string
}

type WeatherData = {
  city: string
  temperature: number
  condition: string
  icon: string
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WeatherFormData>()

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "clear":
        return <Sun className="h-10 w-10" />
      case "rain":
        return <CloudRain className="h-10 w-10" />
      case "snow":
        return <CloudSnow className="h-10 w-10" />
      case "thunderstorm":
        return <CloudLightning className="h-10 w-10" />
      default:
        return <Cloud className="h-10 w-10" />
    }
  }

  const fetchWeatherByCity = async (city: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`)

      if (!response.ok) {
        throw new Error("City not found")
      }

      const data = await response.json()
      setWeather({
        city: data.city,
        temperature: data.temperature,
        condition: data.condition,
        icon: data.icon,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch weather data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchWeatherByLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log("in getting curr pointion", position)
        try {
          const { latitude, longitude } = position.coords
          console.log("in getting curr pointion", position)
          const response = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`)

          if (!response.ok) {
            throw new Error("Failed to get weather for your location")
          }

          const data = await response.json()
          setWeather({
            city: data.city,
            temperature: data.temperature,
            condition: data.condition,
            icon: data.icon,
          })
        } catch (error) {

          console.log("fasdfas")
          toast({
            title: "Error",
            description: "Failed to fetch weather data for your location",
            variant: "destructive",
          })
        } finally {
          setLoading(false)
        }
      },
      () => {
        toast({
          title: "Error",
          description: "Location permission denied",
          variant: "destructive",
        })
        setLoading(false)
      },
    )
  }

  const onSubmit = (data: WeatherFormData) => {
    fetchWeatherByCity(data.city)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-2">
          <div className="flex space-x-2">
            <Input
              {...register("city", { required: "City is required" })}
              placeholder="Enter city name"
              className="border-3 border-black bg-white font-medium"
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-pastel-yellow hover:bg-pastel-yellow/90 text-black border-3 border-black font-bold transform hover:-translate-y-1 transition-transform"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
          {errors.city && <p className="text-red-600 font-bold">{errors.city.message}</p>}
        </form>

        <Button
          onClick={fetchWeatherByLocation}
          disabled={loading}
          className="w-full bg-pastel-green hover:bg-pastel-green/90 text-black border-3 border-black font-bold transform hover:-translate-y-1 transition-transform"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MapPin className="h-4 w-4 mr-2" />}
          Get My Location
        </Button>
      </div>

      <Card className="border-3 border-black p-4 bg-white shadow-brutal">
        {weather ? (
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-bold">{weather.city}</h3>
            <div className="flex items-center space-x-2">
              {getWeatherIcon(weather.condition)}
              <span className="text-3xl font-black">{weather.temperature}°C</span>
            </div>
            <p className="text-lg capitalize">{weather.condition}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-lg font-bold">Enter a city or use your location</p>
            <Cloud className="h-10 w-10 mt-2 text-gray-400" />
          </div>
        )}
      </Card>
    </div>
  )
}
