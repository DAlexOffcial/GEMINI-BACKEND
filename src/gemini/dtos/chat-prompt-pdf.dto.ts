import { IsArray, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class ChatPromptPdfDto {

    @IsString()
    @IsNotEmpty()
    prompt: string;

    @IsArray()
    files: Express.Multer.File[];

    @IsUUID()
    chatId: string;
}