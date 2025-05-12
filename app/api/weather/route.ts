import { NextResponse } from "next/server"

// Mock weather data for demonstration
const weatherConditions = ["Clear", "Cloudy", "Rain", "Snow", "Thunderstorm"]
const cities = {
  "riyadh": { lat: 40.7128, lon: -74.006 },
  "london": { lat: 51.5074, lon: -0.1278 },
  "tokyo": { lat: 35.6762, lon: 139.6503 },
  "paris": { lat: 48.8566, lon: 2.3522 },
  "sydney": { lat: -33.8688, lon: 151.2093 },
}


function isCityKey(key: string): key is keyof typeof cities {
  return key in cities;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get("city")?.toLowerCase()
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    let location = "Unknown"
    let coordinates = { lat: 0, lon: 0 }

    if (city && isCityKey(city)) {
      location = city.charAt(0).toUpperCase() + city.slice(1)
      coordinates = cities[city]
    } else if (lat && lon) {
      // Reverse geocoding simulation
      const latNum = Number.parseFloat(lat)
      const lonNum = Number.parseFloat(lon)

      // Find closest city (very simplified)
      let closestCity = ""
      let minDistance = Number.MAX_VALUE

      for (const [cityName, coords] of Object.entries(cities)) {
        const distance = Math.sqrt(Math.pow(latNum - coords.lat, 2) + Math.pow(lonNum - coords.lon, 2))

        if (distance < minDistance) {
          minDistance = distance
          closestCity = cityName
        }
      }

      location = closestCity.charAt(0).toUpperCase() + closestCity.slice(1)
      coordinates = { lat: latNum, lon: lonNum }
      console.log(coordinates)
    } else {
      return NextResponse.json({ error: "City or coordinates required" }, { status: 400 })
    }

    // Generate random weather data
    const condition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)]
    const temperature = Math.round(Math.random() * (30 - 5) + 5) // 5°C to 30°C

    return NextResponse.json({
      city: location,
      temperature,
      condition,
      icon: condition.toLowerCase(),
      coordinates,
    })
  } catch (error) {
    console.error("Weather API error:", error)
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
  }
}
