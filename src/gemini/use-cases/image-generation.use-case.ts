import { ContentListUnion, createPartFromUri, GoogleGenAI } from "@google/genai";
import { geminiUploadFiles } from "../helpers/gemini-upload-file";
import { ImageGenerationDto } from "../dtos/image-generation.dto";


interface Options {
  model?: string;
  systemInstructions?: string;
}

export interface ImageGenerationResponce {
  imageUrl: string;
  text: string;
}

export const imageGenerationUseCase = async (
    ai: GoogleGenAI , 
    imageGenerationDto: ImageGenerationDto,
    options?: Options
) : Promise<ImageGenerationResponce> => {
   
  const { prompt, files = [] } = imageGenerationDto;
  
  const contents: ContentListUnion = [
    { text: prompt }
  ]

  const uploadedFiles = await geminiUploadFiles(ai, files);

  uploadedFiles.forEach(file => {
    contents.push( createPartFromUri(file.uri ?? '' , file.mimeType ?? ''))
  })

  const { 
    model = 'imagen-3.0-generate-002',
  } = options ?? {};

  const response = await ai.models.generateImages({
    model: model,
    prompt: prompt,
    config: {
      numberOfImages: 1,
    },
  });


  for (const generatedImage of response.generatedImages) {
    let imgBytes = generatedImage.image.imageBytes;
    const buffer = Buffer.from(imgBytes, "base64");
    console.log(buffer);
  }

  return {
    imageUrl: 'xx',
    text: 'xx',
  }
} 