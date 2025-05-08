import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { QuestionsModule } from '../questions/questions.module';
import { UserModule } from '../user/user.module';
import { AudioModule } from 'src/audio/audio.module';

@Module({
  imports: [
    HttpModule,
    forwardRef(() => QuestionsModule),
    UserModule,
    AudioModule,
  ],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
