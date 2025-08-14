import { Injectable } from '@nestjs/common';
import { basicPromptDto } from '../dtos/basic-promts.dto';
import { Content, GoogleGenAI } from '@google/genai';
import { basicPromptUseCase } from '../use-cases/basic-prompt.use-case';
import { basicPromptStreamUseCase } from '../use-cases/basic-prompt-stream.use-case';
import { ChatPromptDto } from '../dtos/chat-prompt.dto';
import { chatPromptStreamUseCase } from '../use-cases/chat-prompt-stream.use-case';
import { ImageGenerationDto } from '../dtos/image-generation.dto';
import { imageGenerationUseCase } from '../use-cases/image-generation.use-case';
import { chatPromptStreamWithContextUseCase } from '../use-cases/chat-prompt-stream-with-context.use-case';
import { documentsUnderstending } from '../use-cases/document-understanding';


@Injectable()
export class GeminiService {
     
    private ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY})

    private chatHistory = new Map<string, Content[]>();

    /*async chat*/
    async basicPrompt(basicPromptDto: basicPromptDto) {
        return basicPromptUseCase(this.ai , basicPromptDto)
    }

    /*stream chat*/
    async basicPromptStream(basicPromptDto: basicPromptDto) {
        return basicPromptStreamUseCase(this.ai , basicPromptDto) 
    } 
     
    /*stream chat with cache history*/
    async chatStream(chatPromptDto: ChatPromptDto) {
        const chatHistory = this.getChatHistory(chatPromptDto.chatId)
        return chatPromptStreamUseCase(this.ai , chatPromptDto, {
            history: chatHistory
        }) 
    }

    /*stream chat with cache history and suport context*/
    async chatStreamWithPdfDocumentContext(chatPromptDto: ChatPromptDto) {
        const chatHistory = this.getChatHistory(chatPromptDto.chatId)

        // Generar contexto de la empresa a partir de los archivos
        const organizationContext = await documentsUnderstending(
          this.ai, 
          chatPromptDto.files || [], {
          systemInstructions: `
            Analiza los siguientes documentos para extraer el contexto de la empresa.
            Resume las reglas, procesos y estructura del negocio.
          `
        });

        return chatPromptStreamWithContextUseCase(this.ai , chatPromptDto, {
            history: chatHistory,
            context: organizationContext.text
        }) 
    }
    
    /*obtener el historial del chat*/
    getChatHistory(chatId: string) : Content[] {
        return structuredClone(this.chatHistory.get(chatId) ?? [])
    }

    /*guardar mensajes en la cache del backend*/
    saveMessage(chatId: string, message: Content ){
      const messages = this.getChatHistory(chatId);
      messages.push(message);
      this.chatHistory.set(chatId, messages)
      console.log(this.chatHistory)
    }
    
    imageGeneration(ImageGenerationDto: ImageGenerationDto){
        return imageGenerationUseCase(this.ai , ImageGenerationDto);
    }
    
}
