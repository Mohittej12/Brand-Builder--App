import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface BrandAsset {
  id: string;
  medium: string;
  url: string;
  prompt: string;
}

export async function generateProductDescription(productInput: string): Promise<string> {
  const model = "gemini-3-flash-preview";
  const response = await ai.models.generateContent({
    model,
    contents: `You are a product designer. Create a highly detailed visual description for a product based on this input: "${productInput}". 
    Focus strictly on its physical appearance, colors, materials, texture, and branding elements. 
    Ensure the description is optimized for image generation prompts. 
    Do not include any people or environments. Just the product itself.
    Keep it concise and descriptive.`,
  });

  return response.text || productInput;
}

export async function generateBrandImage(
  productDescription: string,
  medium: 'billboard' | 'newspaper' | 'social'
): Promise<{ url: string; prompt: string }> {
  // Use gemini-2.5-flash-image for "Nano Banana" as per skill guidelines
  const model = "gemini-2.5-flash-image";
  
  let mediumPrompt = "";
  let aspectRatio: "1:1" | "16:9" | "4:3" | "9:16" = "1:1";

  switch (medium) {
    case 'billboard':
      mediumPrompt = "The product is displayed on a massive roadside billboard in a city, high-angle view, vibrant lighting, highly detailed, photorealistic, clear blue sky background.";
      aspectRatio = "16:9";
      break;
    case 'newspaper':
      mediumPrompt = "A full-page print advertisement in a vintage newspaper. Black and white halftone texture, grainy paper, luxury typography layout, product is the main focus.";
      aspectRatio = "4:3";
      break;
    case 'social':
      mediumPrompt = "A minimalist social media product shot, clean studio lighting, soft shadows, pastel background, premium aesthetic, 4k resolution, sharp focus.";
      aspectRatio = "1:1";
      break;
  }

  const prompt = `${mediumPrompt} The product is: ${productDescription}. STRICT REQUIREMENT: No people, humans, or body parts should be visible in the image. Focus only on the product and the medium. Style: clean, professional, high-end photography.`;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio,
      }
    }
  });

  let imageUrl = "";
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }

  if (!imageUrl) {
    throw new Error("Failed to generate image.");
  }

  return { url: imageUrl, prompt };
}
