import { forwardRef, Module } from '@nestjs/common';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { MessageModule } from '../message/message.module';
import { UserModule } from '../user/user.module';
@Module({
  imports: [forwardRef(() => MessageModule), UserModule],
  controllers: [QuestionsController],
  providers: [QuestionsService],
  exports: [QuestionsService],
})
export class QuestionsModule {}
