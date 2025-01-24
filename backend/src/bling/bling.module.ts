import { Module } from '@nestjs/common';
import { BlingService } from './bling.service';
import { BlingController } from './bling.controller';
import { OAuthModule } from 'src/o-auth/o-auth.module';

@Module({
  imports: [OAuthModule],
  controllers: [BlingController],
  providers: [BlingService],
  exports: [BlingService],
})
export class BlingModule {}
