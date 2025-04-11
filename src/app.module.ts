import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { QuestionsModule } from './questions/questions.module';

@Module({
  imports: [ConfigModule.forRoot(), WhatsappModule, QuestionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
