import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OAuthService } from './o-auth.service';
import { OAuthController } from './o-auth.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [ConfigModule],
  providers: [OAuthService, PrismaService],
  controllers: [OAuthController],
  exports: [OAuthService],
})
export class OAuthModule {}
