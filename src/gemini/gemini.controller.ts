import { Body, Controller, Get, HttpStatus, Param, Post, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { Response } from 'express'
import { GeminiService } from './services/gemini.service';
import { basicPromptDto } from './dtos/basic-promts.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ChatPromptDto } from './dtos/chat-prompt.dto';
import { GenerateContentResponse } from '@google/genai';
import { ImageGenerationDto } from './dtos/image-generation.dto';
import { ChatPromptPdfDto } from './dtos/chat-prompt-pdf.dto';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  async outputStreamResponce(res: Response, stream: AsyncGenerator<GenerateContentResponse, any, any>) {

    res.setHeader('Content-Type' , 'text/plain');
    res.status(HttpStatus.OK);  

    let resultText = ''
    for await (const chunk of stream) {
      const piece = chunk.text;
      resultText += piece;
      res.write(piece);
    }

    res.end();
    return resultText;
  }

  @Post('basic-prompt')
  basicPrompt( @Body(  ) basicPromptDto:basicPromptDto ){
    return this.geminiService.basicPrompt(basicPromptDto); 
  }

  @Post('basic-prompt-stream')
  @UseInterceptors(FilesInterceptor('files'))
  async basicPromptStream( 
    @Body(  ) basicPromptDto:basicPromptDto,
    @Res() res: Response,
    @UploadedFiles() files: Array<Express.Multer.File>
  ){

    basicPromptDto.files = files;

    const stream = await this.geminiService.basicPromptStream(basicPromptDto); 

    void this.outputStreamResponce(res, stream)
  }
  

  /*controlador del chat stream*/ 
  @Post('chat-stream')
  @UseInterceptors(FilesInterceptor('files'))
  async chatStream( 
    @Body( ) chatPromptDto: ChatPromptDto,
    @Res() res: Response,
    @UploadedFiles() files: Array<Express.Multer.File>
  ){

    chatPromptDto.files = files;

    const stream = await this.geminiService.chatStream(chatPromptDto); 

    const data = await this.outputStreamResponce(res, stream);

    const userMessage = {
      role: 'user',
      parts: [{ text: chatPromptDto.prompt}]
    }
    const geminiMessage = {
      role: 'model',
      parts: [{ text: data}]
    }

    this.geminiService.saveMessage( chatPromptDto.chatId,  userMessage)
    this.geminiService.saveMessage( chatPromptDto.chatId,  geminiMessage)
  }

  /*controlador del chat stream con contexto del negocio*/ 
  @Post('chat-stream-with-pdf-document-context')
  @UseInterceptors(FilesInterceptor('files'))
  async chatStreamWithContext( 
    @Body( ) chatPromptDto: ChatPromptPdfDto,
    @Res() res: Response,
    @UploadedFiles() files: Array<Express.Multer.File>
  ){

    chatPromptDto.files = files;

    const stream = await this.geminiService.chatStreamWithPdfDocumentContext(chatPromptDto); 

    const data = await this.outputStreamResponce(res, stream);

    const userMessage = {
      role: 'user',
      parts: [{ text: chatPromptDto.prompt }]
    }
    const geminiMessage = {
      role: 'model',
      parts: [{ text: data }]
    }

    this.geminiService.saveMessage( chatPromptDto.chatId,  userMessage)
    this.geminiService.saveMessage( chatPromptDto.chatId,  geminiMessage)
  }

  /* obtener el historial del chat por id */
  @Get('chat-history/:chatId')
  getChatHistory( @Param('chatId') chatId: string){
    return this.geminiService.getChatHistory( chatId ).map( message => ({
      role: message.role,
      parts: message.parts?.map( part => part.text).join('')
    }))
  }

  @Post('image-generation')
  @UseInterceptors(FilesInterceptor('files'))
  async ImageGeneration(
    @Body() ImageGenerationDto: ImageGenerationDto,
    @UploadedFiles() files: Array<Express.Multer.File>
  ){
    ImageGenerationDto.files = files

    const {imageUrl, text} = await this.geminiService.imageGeneration(ImageGenerationDto)

    return {
      imageUrl,
      text
    }
  }

}
