"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Search, MapPin, Cloud, Sun, CloudRain, CloudSnow, CloudLightning } from "lucide-react"

type WeatherFormData = {
  city: string
}

type WeatherData = {
  city: string
  temperature: {
    temp_c: number,
    temp_f: number
  }
  condition: {
    text: string
  },
  icon: string
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [isFahrenheit, setIsFahrenheit] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WeatherFormData>()


  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "sunny":
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
        temperature: {
          temp_f: data.current.temp_f,
          temp_c: data.current.temp_c,
        },
        condition: data.current.condition,
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
    toast({
      title: "Fetching weather data",
      description: "Please wait while we get your location",
      variant: "default",
    })
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const response = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`)

          if (!response.ok) {
            throw new Error("Failed to get weather for your location")
          }

          const data = await response.json()
          setWeather({
            city: data.city,
            temperature: {
              temp_f: data.current.temp_f,
              temp_c: data.current.temp_c,
            },
            condition: data.current.condition,
            icon: data.icon,
          })
        } catch (error) {

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

  const displayTemperature = (currentWeather: WeatherData) => {
    return isFahrenheit ? currentWeather.temperature.temp_f : currentWeather.temperature.temp_c
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

        <div className="flex items-center space-x-2 mt-2">
          <Switch id="temp-unit" checked={isFahrenheit} onCheckedChange={setIsFahrenheit} />
          <Label htmlFor="temp-unit" className="font-bold">
            {isFahrenheit ? "Fahrenheit (°F)" : "Celsius (°C)"}
          </Label>
        </div>
        {weather ? (
          <div className="flex flex-col items-center p-2">
            <h3 className="text-xl font-bold">{weather.city}</h3>
            <div className="flex items-center space-x-2">
              {getWeatherIcon(weather.condition.text)}
              <span className="text-3xl font-black">
                {displayTemperature(weather)}°{isFahrenheit ? "F" : "C"}
              </span>
            </div>
            <p className="text-lg capitalize">{weather.condition.text}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-2">
            <p className="text-lg font-bold">Enter a city or use your location</p>
            <Cloud className="h-10 w-10 mt-2 text-gray-400" />
          </div>
        )}
      </Card>
    </div>
  )
}
