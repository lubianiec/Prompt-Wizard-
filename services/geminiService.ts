import { GoogleGenAI, Type } from "@google/genai";
import { PromptStructure, Locale } from '../types';

const getGeminiClient = () => {
  const apiKeyFromSession = sessionStorage.getItem('gemini_api_key');
  const apiKey = apiKeyFromSession || process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API Key not found. Please provide one.");
  }
  return new GoogleGenAI({ apiKey });
};


const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    scene: { type: Type.STRING, description: 'Comma-separated keywords for: environment, atmosphere, background, time of day, weather.' },
    subject: { type: Type.STRING, description: 'Comma-separated keywords for: the main object or character, with attributes, characteristics, and actions.' },
    outfit: { type: Type.STRING, description: "Comma-separated keywords for the character's clothing, accessories, and attire. If no character is present, this should be an empty string." },
    style: { type: Type.STRING, description: 'Comma-separated keywords for: artistic style, technique, era, aesthetics (e.g., "oil painting, Vincent van Gogh style, cinematic photography, pixel art").' },
    lighting: { type: Type.STRING, description: 'Comma-separated keywords for: type and direction of light, intensity, color (e.g., "dramatic volumetric lighting, golden hour, neon glow").' },
    camera: { type: Type.STRING, description: 'Comma-separated keywords for: shot, angle, lens type, distance (e.g., "wide-angle shot, close-up, 85mm lens").' },
    details: { type: Type.STRING, description: 'Comma-separated keywords for: quality parameters, image details (e.g., "ultra-detailed, 4K, photorealistic, intricate details").' },
    mood: { type: Type.STRING, description: 'Comma-separated keywords for: desired emotions or atmosphere (e.g., "melancholy, joyful, ominous").' },
    negativePrompt: { type: Type.STRING, description: 'Comma-separated keywords for: elements to avoid (e.g., "low quality, blurred, watermark, text, signature").' },
  },
  required: ['scene', 'subject', 'outfit', 'style', 'lighting', 'camera', 'details', 'mood', 'negativePrompt'],
};

const parseJsonResponse = (text: string): PromptStructure => {
  try {
    const cleanedText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (e) {
    console.error("Failed to parse JSON response:", text);
    throw new Error("The AI returned an invalid response format. Please try again.");
  }
};

const getSystemInstruction = (task: 'structure' | 'compact' | 'video' | 'professional' | 'imageEditCompact' | 'imageEditStructured', locale: Locale, inputType?: 'text', includeImageDetails?: boolean): string => {
    const instructions = {
        pl: { // Polish instructions are kept for potential future use but are not used for generation.
            // ... (polish instructions kept for reference)
        },
        en: {
            structure: "You are an expert prompt engineer. Your task is to generate a structured JSON prompt for text-to-image models. Each field in the JSON must be populated with a rich, comma-separated list of keywords, phrases, and concepts. If a person or character is a prominent subject, describe their clothing, attire, and accessories in the `outfit` field. If no character is present, the `outfit` field must be an empty string. Ensure the `details` field always includes keywords for the highest quality: `8k resolution, 4k resolution, photorealistic, masterpiece, --ar 16:9`. Do not use full sentences. All output must be in English. If any part of the generated prompt might be considered sensitive or violate content policies, intelligently rephrase it to be policy-compliant while preserving the core artistic or descriptive intent.",
            structureText: "You are an expert prompt engineer. Your task is to generate a structured JSON prompt for text-to-image models based on the user's idea. Each field must be populated with a rich, comma-separated list of keywords. If the user's idea clearly describes a character, describe their clothing in the `outfit` field; otherwise, it must be an empty string. Ensure the `details` field always includes keywords for the highest quality: `8k resolution, 4k resolution, photorealistic, masterpiece, --ar 16:9`. Do not use full sentences. All output must be in English. If any part of the generated prompt might be considered sensitive or violate content policies, intelligently rephrase it to be policy-compliant while preserving the core artistic or descriptive intent.",
            compact: "You are an expert prompt engineer. Your task is to generate a single, detailed paragraph for a text-to-image model. The output must be a rich, comma-separated list of keywords, phrases, and concepts that always includes terms for the highest quality: `8k resolution, 4k resolution, photorealistic, masterpiece, --ar 16:9`. Do not use full sentences or conversational text. All output must be in English. If any part of the generated prompt might be considered sensitive or violate content policies, intelligently rephrase it to be policy-compliant while preserving the core artistic or descriptive intent.",
            compactText: "You are an expert prompt engineer. Your task is to generate a single, detailed paragraph for a text-to-image model based on the user's idea. The output must be a rich, comma-separated list of keywords, phrases, and concepts that always includes terms for the highest quality: `8k resolution, 4k resolution, photorealistic, masterpiece, --ar 16:9`. Do not use full sentences or conversational text. All output must be in English. If any part of the generated prompt might be considered sensitive or violate content policies, intelligently rephrase it to be policy-compliant while preserving the core artistic or descriptive intent.",
            video: "You are a world-class video prompt engineer. Your task is to generate a high-quality, professional video prompt in English. Synthesize the user's input (image and text) into a single block of text. The output must be a comma-separated list of cinematic keywords focusing on motion, camera movement, character actions, visual style, and mood that always includes terms for the highest quality: `8k resolution, 4k resolution, cinematic, photorealistic, masterpiece, --ar 16:9`. Do not use conversational language. If any part of the generated prompt might be considered sensitive or violate content policies, intelligently rephrase it to be policy-compliant while preserving the core artistic or descriptive intent.",
            videoWithDetails: "You are a world-class video prompt engineer. Your task is to generate a high-quality, professional video prompt that is visually faithful to a reference image. Follow these steps: 1. **Analyze the Image**: Meticulously describe the provided image in detail (subject, composition, style, color palette, lighting). 2. **Integrate User Request**: Seamlessly merge your detailed image description with the user's video scene description, giving priority to the user's action/motion request. 3. **Format Output**: The final output must be a single block of text—a rich, comma-separated list of cinematic keywords that always includes terms for the highest quality: `8k resolution, 4k resolution, cinematic, photorealistic, masterpiece, --ar 16:9`. All output must be in English. If any part of the generated prompt might be considered sensitive or violate content policies, intelligently rephrase it to be policy-compliant while preserving the core artistic or descriptive intent.",
            professional: `You are an AI assistant and an expert in professional prompt engineering. Your task is to transform a user's simple text input into a sophisticated, highly-effective prompt for another AI model. The final output must be in English and strictly follow this format, using Markdown for headers:
**ROLE:** [Clearly define the AI's persona, e.g., 'You are a senior Python developer specializing in data analysis...']
**TASK:** [State the primary, specific goal the AI should accomplish, e.g., 'Write a Python script that...']
**CONTEXT:** [Provide all necessary background information, constraints, and details the AI needs to complete the task successfully.]
**OUTPUT FORMAT:** [Specify the exact format of the desired output, e.g., 'Provide only the raw Python code in a single code block.', 'Respond with a JSON object containing...', 'Structure your answer in a Markdown table with the following columns...']
Do not include any other text, greetings, or explanations outside of this structure. If any part of the generated prompt might be considered sensitive or violate content policies, intelligently rephrase it to be policy-compliant while preserving the core artistic or descriptive intent.`,
            imageEditCompact: "You are an expert prompt engineer. Your task is to generate a single, detailed paragraph for a text-to-image model. First, analyze the provided image to understand its core subject, scene, style, and composition. Then, seamlessly integrate the user's requested modifications described in the text. If the user provides no modifications, generate a prompt that richly describes the original image. The final output must be a rich, comma-separated list of keywords and phrases describing the new, modified image that always includes terms for the highest quality: `8k resolution, 4k resolution, photorealistic, masterpiece, --ar 16:9`. Do not use full sentences or conversational text. All output must be in English. If any part of the generated prompt might be considered sensitive or violate content policies, intelligently rephrase it to be policy-compliant while preserving the core artistic or descriptive intent.",
            imageEditStructured: "You are an expert prompt engineer. Your task is to generate a structured JSON prompt for text-to-image models. First, analyze the provided image to understand its core subject, scene, style, and composition. Then, seamlessly integrate the user's requested modifications described in the text to create a new vision. If the user provides no modifications, generate a structured prompt that richly describes the original image. Populate each field in the JSON with a rich, comma-separated list of keywords and phrases describing the new, modified image. If a character is present in the final, modified image, describe their clothing, attire, and accessories in the `outfit` field. If no character is present, the `outfit` field must be an empty string. Ensure the `details` field always includes keywords for the highest quality: `8k resolution, 4k resolution, photorealistic, masterpiece, --ar 16:9`. Do not use full sentences. All output must be in English. If any part of the generated prompt might be considered sensitive or violate content policies, intelligently rephrase it to be policy-compliant while preserving the core artistic or descriptive intent.",
        }
    };

    const langInstructions = instructions.en;

    if (task === 'video' && includeImageDetails) {
        return langInstructions.videoWithDetails;
    }
    if (task === 'structure' && inputType === 'text') return langInstructions.structureText;
    if (task === 'compact' && inputType === 'text') return langInstructions.compactText;
    return langInstructions[task];
};


export const generatePromptFromImage = async (base64Image: string, mimeType: string, locale: Locale): Promise<PromptStructure> => {
  const ai = getGeminiClient();
  const imagePart = { inlineData: { data: base64Image, mimeType } };
  const systemInstruction = getSystemInstruction('structure', locale);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart] },
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
    }
  });

  return parseJsonResponse(response.text);
};

export const generatePromptFromText = async (inputText: string, locale: Locale): Promise<PromptStructure> => {
  const ai = getGeminiClient();
  const systemInstruction = getSystemInstruction('structure', locale, 'text');

  const contents = `User's idea: "${inputText}"`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: contents,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
    }
  });

  return parseJsonResponse(response.text);
};

export const generateCompactPromptFromText = async (inputText: string, locale: Locale): Promise<string> => {
    const ai = getGeminiClient();
    const systemInstruction = getSystemInstruction('compact', locale, 'text');
  
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `User's idea: "${inputText}"`,
      config: { systemInstruction }
    });
  
    return response.text;
};
  
export const generateCompactPromptFromImage = async (base64Image: string, mimeType: string, locale: Locale): Promise<string> => {
  const ai = getGeminiClient();
  const imagePart = { inlineData: { data: base64Image, mimeType } };
  const systemInstruction = getSystemInstruction('compact', locale);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart] },
    config: { systemInstruction }
  });

  return response.text;
};

export const generateVideoPromptFromImageAndText = async (base64Image: string, mimeType: string, videoDescription: string, locale: Locale, includeImageDetails?: boolean): Promise<string> => {
  const ai = getGeminiClient();
  const imagePart = { inlineData: { data: base64Image, mimeType } };
  const textPart = { text: `User's video scene description: "${videoDescription}"` }
  const systemInstruction = getSystemInstruction('video', locale, undefined, includeImageDetails);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, textPart] },
    config: { systemInstruction }
  });

  return response.text;
}

export const generateProfessionalPromptFromText = async (inputText: string, locale: Locale): Promise<string> => {
  const ai = getGeminiClient();
  const systemInstruction = getSystemInstruction('professional', locale);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: `User's simple idea: "${inputText}"`,
    config: { systemInstruction }
  });

  return response.text;
};

export const generateCompactImageEditPrompt = async (base64Image: string, mimeType: string, changes: string, locale: Locale): Promise<string> => {
  const ai = getGeminiClient();
  const imagePart = { inlineData: { data: base64Image, mimeType } };
  const textPart = { text: `User's requested modifications: "${changes}"` };
  const systemInstruction = getSystemInstruction('imageEditCompact', locale);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, textPart] },
    config: { systemInstruction }
  });

  return response.text;
};

export const generateStructuredImageEditPrompt = async (base64Image: string, mimeType: string, changes: string, locale: Locale): Promise<PromptStructure> => {
  const ai = getGeminiClient();
  const imagePart = { inlineData: { data: base64Image, mimeType } };
  const textContent = `User's requested modifications: "${changes}"`;
  const textPart = { text: textContent };
  const systemInstruction = getSystemInstruction('imageEditStructured', locale);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, textPart] },
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
    }
  });

  return parseJsonResponse(response.text);
};