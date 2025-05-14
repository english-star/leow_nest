import {
  Controller,
  Post,
  Body,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AudioService } from './audio.service';
import { TranscribeDto } from './dto/audio.dto';

@Controller('audio')
export class AudioController {
  private readonly logger = new Logger(AudioController.name);

  constructor(private readonly audioService: AudioService) {}

  @Post('transcribe')
  async transcribe(@Body() transcribeDto: TranscribeDto): Promise<any> {
    try {
      this.logger.log(
        `Received transcription request for URL: ${transcribeDto.url}`,
      );

      if (!transcribeDto.url) {
        throw new HttpException('URL is required', HttpStatus.BAD_REQUEST);
      }

      const transcript = await this.audioService.transcribe(transcribeDto.url);

      return {
        success: true,
        transcript,
      };
    } catch (error) {
      this.logger.error(`Transcription failed: ${error}`);
      throw new HttpException(
        `Failed to transcribe audio: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
