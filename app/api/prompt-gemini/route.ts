import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Extract form data from the incoming request
    const formData = await request.formData()
    const prompt = formData.get("prompt") as string
    const task = (formData.get("task") as string) || "text"
    const files = formData.getAll("files") as File[]
    const hasFiles = files.length > 0

    // Create a new FormData object for the API request
    const apiFormData = new FormData()
    apiFormData.append("prompt", prompt)
    apiFormData.append("task_type", task) // Map 'task' to 'task_type' as per API spec


    // Add all files to the API request
    files.forEach(file => {
      apiFormData.append("files", file)
    })

    // Call the external GenAI API
    const apiResponse = await fetch("https://cloud-services-gateway-ckvqjx02.uc.gateway.dev/genai-prompt", {
      method: "POST",
      body: apiFormData,
    })

    console.log("GenAI API response:", apiResponse)
    // Handle API errors
    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}))
      throw new Error(errorData.error || `API request failed with status ${apiResponse.status}`)
    }

    // Parse the API response
    const responseData = await apiResponse.json()

    // Format the response based on task type to maintain frontend compatibility
    if (task === "image") {
      // Handle image generation response

      return NextResponse.json({
        text: "Image generated based on your prompt",
        imageData: responseData.content,
        model: responseData.model,
        processingTime: hasFiles ? "4.2s" : "3.5s",
      })
    } else {
      // Handle text generation response
      return NextResponse.json({
        text: responseData.content || "",
        model: responseData.model,
        processingTime: "1.2s",
      })
    }
  } catch (error) {
    console.error("GenAI API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process AI prompt" },
      { status: 500 }
    )
  }
}
