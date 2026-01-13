// Google Cloud Vision API OCR client

interface VisionResponse {
  fullTextAnnotation?: {
    text: string;
  };
}

export async function extractTextFromImage(
  imageBuffer: Buffer
): Promise<string> {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (!apiKey && !credentialsJson) {
    throw new Error(
      "Missing Google Cloud Vision credentials. Set GOOGLE_CLOUD_VISION_API_KEY or GOOGLE_APPLICATION_CREDENTIALS_JSON"
    );
  }

  try {
    // Convert buffer to base64
    const base64Image = imageBuffer.toString("base64");

    // Use REST API with API key (simpler than service account)
    const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: base64Image,
            },
            features: [
              {
                type: "DOCUMENT_TEXT_DETECTION",
                maxResults: 1,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Vision API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const result = data.responses?.[0] as VisionResponse;

    if (!result?.fullTextAnnotation?.text) {
      return "";
    }

    return result.fullTextAnnotation.text;
  } catch (error) {
    console.error("OCR extraction error:", error);
    throw error;
  }
}

export async function extractTextFromPages(
  page1Buffer: Buffer,
  page2Buffer: Buffer
): Promise<string> {
  const [text1, text2] = await Promise.all([
    extractTextFromImage(page1Buffer),
    extractTextFromImage(page2Buffer),
  ]);

  return `=== PAGE 1 ===\n${text1}\n\n=== PAGE 2 ===\n${text2}`;
}
