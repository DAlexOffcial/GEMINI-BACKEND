import { createPartFromUri, createUserContent, GoogleGenAI } from "@google/genai";
import { basicPromptDto } from "../dtos/basic-promts.dto";
import { geminiUploadFiles } from "../helpers/gemini-upload-file";

interface Options {
  model?: string;
  systemInstructions?: string;
}

export const basicPromptStreamUseCase = async (
    ai: GoogleGenAI , 
    basicPromptDto: basicPromptDto,
    options?: Options
) => {
   
    const { prompt, files = []} = basicPromptDto;

    const images = await geminiUploadFiles(ai, files);

    const { 
      model = 'gemini-2.5-flash',
      systemInstructions = `
        Responde unicamente en español, en formato markdown
      `
     } = options ?? {};

    const response = await ai.models.generateContentStream({
      model: model,
      contents: [
        createUserContent([
          prompt,
          ...images.map((image) => createPartFromUri(image.uri ?? '' , image.mimeType ?? ''))
        ])
      ],
      config: {
        systemInstruction: systemInstructions,
      }
    });

    
    return response;
}