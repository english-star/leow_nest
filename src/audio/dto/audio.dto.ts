/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsNotEmpty, IsUrl } from 'class-validator';

export class TranscribeDto {
  @IsNotEmpty({ message: 'URL is required' })
  @IsUrl({}, { message: 'Invalid URL format' })
  url: string;
}
