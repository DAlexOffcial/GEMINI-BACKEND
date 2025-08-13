import { GoogleGenAI } from "@google/genai";
import { basicPromptDto } from "../dtos/basic-promts.dto";

interface Options {
    model?: string
}

export const basicPromptUseCase = async (
    ai: GoogleGenAI , 
    basicPromptDto: basicPromptDto,
    options?: Options
) => {
  const { model = 'gemini-2.5-flash' } = options ?? {};
  const response = await ai.models.generateContent({
    model: model,
    contents: basicPromptDto.prompt,
    config: {
      systemInstruction: 'Responde unicamente en español, en formato markdown',
    }
  });
  
  return response.text;
}