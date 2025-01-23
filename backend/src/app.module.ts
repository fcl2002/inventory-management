import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';
import { TagModule } from './tag/tag.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { BlingModule } from './bling/bling.module';
import { OAuthService } from './o-auth/o-auth.service';
import { OAuthController } from './o-auth/o-auth.controller';
import { OAuthModule } from './o-auth/o-auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ProductModule,
    UserModule,
    TagModule,
    PrismaModule,
    UserModule,
    BlingModule,
    OAuthModule
  ],
  controllers: [AppController, OAuthController, OAuthController],
  providers: [AppService, OAuthService, OAuthService],
})
export class AppModule {}