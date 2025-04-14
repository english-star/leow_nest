import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MessageModule } from './message/message.module';
import { QuestionsModule } from './questions/questions.module';

@Module({
  imports: [ConfigModule.forRoot(), MessageModule, QuestionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
