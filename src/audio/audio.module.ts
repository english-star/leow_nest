import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AudioService } from './audio.service';
import { AudioController } from './audio.controller';

@Module({
  imports: [ConfigModule],
  controllers: [AudioController],
  providers: [AudioService],
  exports: [AudioService],
})
export class AudioModule {}
