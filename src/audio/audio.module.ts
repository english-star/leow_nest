import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AudioService } from './audio.service';

@Module({
  imports: [ConfigModule],
  providers: [AudioService],
  exports: [AudioService],
})
export class AudioModule {}
