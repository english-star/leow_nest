import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MessageModule } from './message/message.module';
import { QuestionsModule } from './questions/questions.module';
import { UserModule } from './user/user.module';
import { AudioService } from './audio/audio.service';
import { AudioModule } from './audio/audio.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MessageModule,
    QuestionsModule,
    UserModule,
    AudioModule,
  ],
  controllers: [AppController],
  providers: [AppService, AudioService],
})
export class AppModule {}
