import { forwardRef, Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { MessageModule } from '../message/message.module';
import { UserModule } from '../user/user.module';
@Module({
  imports: [forwardRef(() => MessageModule), UserModule],
  providers: [QuestionsService],
  exports: [QuestionsService],
})
export class QuestionsModule {}
