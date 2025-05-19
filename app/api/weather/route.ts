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
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  // Validate input: must have either city, or both lat and lon
  if (!city && !(lat && lon)) {
    return NextResponse.json(
      { error: "You must provide either a city or both latitude and longitude." },
      { status: 400 }
    );
  }

  // Build query string for the external API
  const params = new URLSearchParams();
  if (city) {
    params.append("city", city);
  } else if (lat && lon) {
    params.append("lat", lat);
    params.append("lon", lon);
  }

  const endpoint = `${process.env.API_GATEWAY_URL}/weather?${params.toString()}`;

  try {
    const response = await fetch(endpoint);

    // Forward the status and response from the external API
    const data = await response.json();

    if (!response.ok) {
      // Forward error from external API
      return NextResponse.json(
        { error: data.error || "Failed to fetch weather data" },
        { status: response.status }
      );
    }

    // Success: return the weather data
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    // Network or unexpected error
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
