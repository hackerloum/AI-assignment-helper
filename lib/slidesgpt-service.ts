/**
 * SlidesGPT API Integration
 * Creates actual .pptx files using SlidesGPT API
 */

const SLIDESGPT_API_KEY = process.env.SLIDESGPT_API_KEY || "jm6fbznofjysacspsx653yffstgbij63";
const SLIDESGPT_API_URL = "https://api.slidesgpt.com/v1/presentations";

export interface SlidesGPTResponse {
  id: string;
  embed: string;
  download: string;
}

export interface SlidesGPTError {
  error?: string;
  message?: string;
}

/**
 * Generate a presentation using SlidesGPT API
 */
export async function generateSlidesGPTPresentation(
  prompt: string,
  templateId?: string
): Promise<SlidesGPTResponse> {
  if (!SLIDESGPT_API_KEY) {
    throw new Error("SLIDESGPT_API_KEY is not configured");
  }

  const body: any = { prompt };
  if (templateId) {
    body.templateId = templateId;
  }

  try {
    const response = await fetch(`${SLIDESGPT_API_URL}/generate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SLIDESGPT_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData: SlidesGPTError = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || errorData.message || `SlidesGPT API error: ${response.statusText}`
      );
    }

    const data: SlidesGPTResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error generating SlidesGPT presentation:", error);
    throw new Error(error.message || "Failed to generate presentation with SlidesGPT");
  }
}

/**
 * Download a presentation file from SlidesGPT
 */
export async function downloadSlidesGPTPresentation(
  presentationId: string
): Promise<Blob> {
  if (!SLIDESGPT_API_KEY) {
    throw new Error("SLIDESGPT_API_KEY is not configured");
  }

  try {
    const response = await fetch(`${SLIDESGPT_API_URL}/${presentationId}/download`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${SLIDESGPT_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorData: SlidesGPTError = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || errorData.message || `SlidesGPT download error: ${response.statusText}`
      );
    }

    // Validate it's a PowerPoint file
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // PPTX files are ZIP archives, they start with "PK" (0x50 0x4B)
    if (uint8Array.length < 2 || uint8Array[0] !== 0x50 || uint8Array[1] !== 0x4B) {
      const text = new TextDecoder().decode(uint8Array.slice(0, 500));
      throw new Error(`Invalid PowerPoint file received: ${text.substring(0, 200)}`);
    }

    return blob;
  } catch (error: any) {
    console.error("Error downloading SlidesGPT presentation:", error);
    throw new Error(error.message || "Failed to download presentation from SlidesGPT");
  }
}

