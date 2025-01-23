import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OAuthService } from './o-auth.service';
import { OAuthController } from './o-auth.controller';

@Module({
  imports: [ConfigModule],
  providers: [OAuthService],
  controllers: [OAuthController],
})
export class OAuthModule {}
