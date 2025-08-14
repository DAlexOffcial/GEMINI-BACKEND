import {  GoogleGenAI } from "@google/genai";

interface Options {
  model?: string;
  systemInstructions?: string;
}

export const documentsUnderstending = async (
    ai: GoogleGenAI , 
    files: Express.Multer.File[],
    options?: Options
) => {
   
  const { 
    model = 'gemini-2.5-flash',
    systemInstructions = `
      
    `,
  } = options ?? {};
     
  const contents = files.map(file => ({
    inlineData: {
      mimeType: file.mimetype,
      data: file.buffer.toString("base64"),
    }
  }));

  const context = await ai.models.generateContent({
      model: model,
      contents: contents,
      config:{ 
        systemInstruction: systemInstructions
      }
  });

  return context;
}