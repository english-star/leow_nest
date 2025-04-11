import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { QuestionsModule } from '../questions/questions.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [QuestionsModule, HttpModule],
  controllers: [WhatsappController],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
