// This file would contain the API client for interacting with the API gateway
// For demo purposes, we're using mock data in the components

export async function fetchWeatherData(location: string) {
  // In a real app, this would be a call to your API gateway
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/weather?location=${encodeURIComponent(location)}`,
  )
  return response.json()
}

export async function sendChatMessage(message: string) {
  //
  // In a real app, this would be a call to your API gateway
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  })
  return response.json()
}

export async function saveChat(chatData: any) {
  // In a real app, this would be a call to your API gateway
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/chats`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(chatData),
  })
  return response.json()
}

export async function fetchSavedChats() {
  // In a real app, this would be a call to your API gateway
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/chats`)
  return response.json()
}

export async function deleteChat(id: string) {
  // In a real app, this would be a call to your API gateway
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/chats/${id}`, {
    method: "DELETE",
  })
  return response.json()
}
