import { Module } from '@nestjs/common';
import { GeminiService } from './services/gemini.service';
import { GeminiController } from './gemini.controller';

@Module({
  controllers: [GeminiController],
  providers: [GeminiService],
})
export class GeminiModule {}
