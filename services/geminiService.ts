import { GoogleGenAI, Type } from "@google/genai";
import { PromptStructure, Locale } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    scene: { type: Type.STRING, description: 'Comma-separated keywords for: environment, atmosphere, background, time of day, weather.' },
    subject: { type: Type.STRING, description: 'Comma-separated keywords for: the main object or character, with attributes, characteristics, and actions.' },
    style: { type: Type.STRING, description: 'Comma-separated keywords for: artistic style, technique, era, aesthetics (e.g., "oil painting, Vincent van Gogh style, cinematic photography, pixel art").' },
    lighting: { type: Type.STRING, description: 'Comma-separated keywords for: type and direction of light, intensity, color (e.g., "dramatic volumetric lighting, golden hour, neon glow").' },
    camera: { type: Type.STRING, description: 'Comma-separated keywords for: shot, angle, lens type, distance (e.g., "wide-angle shot, close-up, 85mm lens").' },
    details: { type: Type.STRING, description: 'Comma-separated keywords for: quality parameters, image details (e.g., "ultra-detailed, 4K, photorealistic, intricate details").' },
    mood: { type: Type.STRING, description: 'Comma-separated keywords for: desired emotions or atmosphere (e.g., "melancholy, joyful, ominous").' },
    negativePrompt: { type: Type.STRING, description: 'Comma-separated keywords for: elements to avoid (e.g., "low quality, blurred, watermark, text, signature").' },
  },
  required: ['scene', 'subject', 'style', 'lighting', 'camera', 'details', 'mood', 'negativePrompt'],
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

const getSystemInstruction = (task: 'structure' | 'compact' | 'video' | 'professional', locale: Locale, inputType?: 'text', includeImageDetails?: boolean): string => {
    const instructions = {
        pl: { // Polish instructions are kept for potential future use but are not used for generation.
            // ... (polish instructions kept for reference)
        },
        en: {
            structure: 'You are an expert prompt engineer. Your task is to generate a structured JSON prompt for text-to-image models. Each field in the JSON must be populated with a rich, comma-separated list of keywords, phrases, and concepts. Do not use full sentences. All output must be in English.',
            structureText: 'You are an expert prompt engineer. Your task is to generate a structured JSON prompt for text-to-image models based on the user\'s idea. Each field in the JSON must be populated with a rich, comma-separated list of keywords, phrases, and concepts. Do not use full sentences. All output must be in English.',
            compact: 'You are an expert prompt engineer. Your task is to generate a single, detailed paragraph for a text-to-image model. The output must be a rich, comma-separated list of keywords, phrases, and concepts. Do not use full sentences or conversational text. All output must be in English.',
            compactText: 'You are an expert prompt engineer. Your task is to generate a single, detailed paragraph for a text-to-image model based on the user\'s idea. The output must be a rich, comma-separated list of keywords, phrases, and concepts. Do not use full sentences or conversational text. All output must be in English.',
            video: 'You are a world-class video prompt engineer. Your task is to generate a high-quality, professional video prompt in English. Synthesize the user\'s input (image and text) into a single block of text. The output must be a comma-separated list of cinematic keywords focusing on motion, camera movement, character actions, visual style, and mood. Do not use conversational language.',
            videoWithDetails: 'You are a world-class video prompt engineer. Your task is to generate a high-quality, professional video prompt that is visually faithful to a reference image. Follow these steps: 1. **Analyze the Image**: Meticulously describe the provided image in detail (subject, composition, style, color palette, lighting). 2. **Integrate User Request**: Seamlessly merge your detailed image description with the user\'s video scene description, giving priority to the user\'s action/motion request. 3. **Format Output**: The final output must be a single block of text—a rich, comma-separated list of cinematic keywords. All output must be in English.',
            professional: `You are an AI assistant and an expert in professional prompt engineering. Your task is to transform a user's simple text input into a sophisticated, highly-effective prompt for another AI model. The final output must be in English and strictly follow this format, using Markdown for headers:
**ROLE:** [Clearly define the AI's persona, e.g., 'You are a senior Python developer specializing in data analysis...']
**TASK:** [State the primary, specific goal the AI should accomplish, e.g., 'Write a Python script that...']
**CONTEXT:** [Provide all necessary background information, constraints, and details the AI needs to complete the task successfully.]
**OUTPUT FORMAT:** [Specify the exact format of the desired output, e.g., 'Provide only the raw Python code in a single code block.', 'Respond with a JSON object containing...', 'Structure your answer in a Markdown table with the following columns...']
Do not include any other text, greetings, or explanations outside of this structure.`
        }
    };

    // FIX: The 'pl' instruction set is empty, causing a type error. As per comments,
    // prompt generation is done in English, so we'll use the 'en' set directly.
    const langInstructions = instructions.en;

    if (task === 'video' && includeImageDetails) {
        return langInstructions.videoWithDetails;
    }
    if (task === 'structure' && inputType === 'text') return langInstructions.structureText;
    if (task === 'compact' && inputType === 'text') return langInstructions.compactText;
    return langInstructions[task];
};


export const generatePromptFromImage = async (base64Image: string, mimeType: string, locale: Locale): Promise<PromptStructure> => {
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
  const systemInstruction = getSystemInstruction('structure', locale, 'text');

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `User's idea: "${inputText}"`,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
    }
  });

  return parseJsonResponse(response.text);
};

export const generateCompactPromptFromText = async (inputText: string, locale: Locale): Promise<string> => {
    const systemInstruction = getSystemInstruction('compact', locale, 'text');
  
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `User's idea: "${inputText}"`,
      config: { systemInstruction }
    });
  
    return response.text;
};
  
export const generateCompactPromptFromImage = async (base64Image: string, mimeType: string, locale: Locale): Promise<string> => {
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
  const systemInstruction = getSystemInstruction('professional', locale);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: `User's simple idea: "${inputText}"`,
    config: { systemInstruction }
  });

  return response.text;
};