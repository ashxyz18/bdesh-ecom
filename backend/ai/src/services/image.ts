import { aiComplete } from "../client";
import type { AICompletionRequest } from "../types";

export interface GenerateImageRequest {
  prompt: string;
  productName?: string;
  storeName?: string;
  style?: "photorealistic" | "artistic" | "minimal" | "luxury" | "playful";
  width?: number;
  height?: number;
  negativePrompt?: string;
  count?: number;
}

export interface GenerateImageResponse {
  images: { url: string; revisedPrompt?: string }[];
  prompt: string;
}

export interface GenerateStoreAssetsRequest {
  storeName: string;
  businessType?: string;
  style?: "minimal" | "bold" | "luxury" | "playful" | "corporate";
  assetTypes: ("logo" | "banner" | "favicon" | "social-facebook" | "social-instagram" | "social-twitter")[];
}

export interface GenerateStoreAssetsResponse {
  assets: {
    type: string;
    url: string;
    prompt: string;
  }[];
}

const STYLE_PROMPTS: Record<string, string> = {
  photorealistic: "photorealistic, high quality, professional photography, sharp focus, detailed",
  artistic: "artistic style, creative composition, vibrant colors, artistic rendering",
  minimal: "minimalist design, clean lines, simple composition, white space, elegant",
  luxury: "luxury aesthetic, premium quality, gold accents, elegant typography, high-end",
  playful: "playful design, bright colors, fun composition, cheerful, energetic",
  corporate: "corporate style, professional, clean, business-like, trustworthy",
  bold: "bold design, strong contrasts, vibrant, eye-catching",
};

const NEGATIVE_PROMPTS = "blurry, low quality, pixelated, distorted, bad anatomy, ugly, oversaturated, watermark, text, signature";

// Replicate API integration
const REPLICATE_API_URL = "https://api.replicate.com/v1/predictions";

async function callReplicateAPI(
  prompt: string,
  negativePrompt: string = NEGATIVE_PROMPTS,
  width: number = 1024,
  height: number = 1024,
  style?: string
): Promise<string> {
  const apiKey = process.env.REPLICATE_API_KEY;
  if (!apiKey) {
    throw new Error("REPLICATE_API_KEY is not configured");
  }

  const stylePrompt = style ? STYLE_PROMPTS[style] || "" : "";
  const fullPrompt = stylePrompt ? `${stylePrompt}, ${prompt}` : prompt;

  const response = await fetch(REPLICATE_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Token ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: "stability-ai/sdxl:latest",
      input: {
        prompt: fullPrompt,
        negative_prompt: negativePrompt || NEGATIVE_PROMPTS,
        width,
        height,
        num_outputs: 1,
        scheduler: "K_EULER",
        num_inference_steps: 30,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Replicate API error: ${response.status} - ${error}`);
  }

  const prediction = (await response.json()) as Record<string, any>;
  
  // Poll for completion
  const pollUrl = prediction.urls?.get;
  if (!pollUrl) {
    return prediction.output?.[0] || "";
  }

  let attempts = 0;
  while (attempts < 30) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const pollResponse = await fetch(pollUrl, {
      headers: { "Authorization": `Token ${apiKey}` },
    });
    const pollData = (await pollResponse.json()) as Record<string, any>;
    
    if (pollData.status === "succeeded") {
      return pollData.output?.[0] || "";
    } else if (pollData.status === "failed") {
      throw new Error(`Image generation failed: ${pollData.error}`);
    }
    
    attempts++;
  }
  
  throw new Error("Image generation timed out");
}

// Fallback: Generate image description using AI (when no API key)
async function generateImageDescription(request: GenerateImageRequest): Promise<string> {
  const systemPrompt = `You are an expert at describing images for e-commerce products. Generate a detailed image description that could be used to create or find a suitable product image.`;
  
  const stylePrompt = request.style ? `Style: ${request.style}.` : "";
  const productContext = request.productName ? `Product: ${request.productName}.` : "";
  const storeContext = request.storeName ? `Store: ${request.storeName}.` : "";
  
  const userPrompt = `Create a detailed image description for: ${request.prompt}. ${productContext} ${storeContext} ${stylePrompt}`;

  try {
    const result = await aiComplete({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      config: { maxTokens: 200, temperature: 0.7 },
    });
    
    return result.content;
  } catch {
    return `Product image for ${request.productName || "product"} - ${request.prompt}`;
  }
}

export async function generateImage(request: GenerateImageRequest): Promise<GenerateImageResponse> {
  const {
    prompt,
    productName,
    storeName,
    style = "photorealistic",
    width = 1024,
    height = 1024,
    negativePrompt,
    count = 1,
  } = request;

  // Try Replicate API first
  if (process.env.REPLICATE_API_KEY) {
    try {
      const imageUrl = await callReplicateAPI(
        prompt,
        negativePrompt,
        width,
        height,
        style
      );
      
      return {
        images: [{ url: imageUrl, revisedPrompt: prompt }],
        prompt,
      };
    } catch (error) {
      console.warn("Replicate API failed, using fallback:", error);
    }
  }

  // Fallback: Generate image description
  const description = await generateImageDescription(request);
  
  // Return a placeholder with description
  const placeholderUrl = `https://placehold.co/${width}x${height}/EEE/31343C?text=${encodeURIComponent(productName || "Product")}`;
  
  return {
    images: [{ url: placeholderUrl, revisedPrompt: description }],
    prompt: description,
  };
}

export async function generateStoreAssets(
  request: GenerateStoreAssetsRequest
): Promise<GenerateStoreAssetsResponse> {
  const { storeName, businessType, style = "corporate", assetTypes } = request;
  
  const assets = await Promise.all(
    assetTypes.map(async (type) => {
      const prompt = buildAssetPrompt(type, storeName, businessType, style);
      
      try {
        const result = await generateImage({
          prompt,
          storeName,
          style: mapStyleToImageStyle(style),
          width: getAssetWidth(type),
          height: getAssetHeight(type),
        });
        
        return {
          type,
          url: result.images[0]?.url || "",
          prompt,
        };
      } catch (error) {
        return {
          type,
          url: `https://placehold.co/${getAssetWidth(type)}x${getAssetHeight(type)}/EEE/31343C?text=${encodeURIComponent(storeName)}`,
          prompt,
        };
      }
    })
  );

  return { assets };
}

function buildAssetPrompt(
  type: string,
  storeName: string,
  businessType?: string,
  style?: string
): string {
  const base = `${style || "professional"} ${businessType || "business"}`;
  
  switch (type) {
    case "logo":
      return `Logo design for ${storeName}, ${base} style, vector graphic, clean lines, suitable for website header, transparent background`;
    case "banner":
      return `Website banner/hero image for ${storeName}, ${base} style, e-commerce theme, space for text overlay, wide format`;
    case "favicon":
      return `Favicon icon for ${storeName}, simple logo mark, ${style} style, square format, recognizable at small sizes`;
    case "social-facebook":
      return `Facebook cover photo for ${storeName}, ${base} style, include brand elements, 820x312px format`;
    case "social-instagram":
      return `Instagram post for ${storeName}, ${base} style, square format, engaging visual`;
    case "social-twitter":
      return `Twitter header for ${storeName}, ${base} style, 1500x500px format, brand consistent`;
    default:
      return `${type} for ${storeName}, ${base} style`;
  }
}

function mapStyleToImageStyle(style: string): "minimal" | "luxury" | "playful" | "photorealistic" {
  const mapping: Record<string, "minimal" | "luxury" | "playful" | "photorealistic"> = {
    minimal: "minimal",
    luxury: "luxury",
    playful: "playful",
    corporate: "photorealistic",
    bold: "photorealistic",
  };
  return mapping[style] || "photorealistic";
}

function getAssetWidth(type: string): number {
  switch (type) {
    case "banner": return 1920;
    case "social-facebook": return 820;
    case "social-twitter": return 1500;
    case "social-instagram": return 1080;
    case "logo": return 800;
    case "favicon": return 512;
    default: return 1024;
  }
}

function getAssetHeight(type: string): number {
  switch (type) {
    case "banner": return 600;
    case "social-facebook": return 312;
    case "social-twitter": return 500;
    case "social-instagram": return 1080;
    case "logo": return 800;
    case "favicon": return 512;
    default: return 1024;
  }
}
