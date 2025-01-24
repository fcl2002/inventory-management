import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { BlingModule } from './bling/bling.module';
import { OAuthService } from './o-auth/o-auth.service';
import { OAuthController } from './o-auth/o-auth.controller';
import { OAuthModule } from './o-auth/o-auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ShopModule } from './shop/shop.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ProductModule,
    UserModule,
    PrismaModule,
    UserModule,
    BlingModule,
    OAuthModule,
    ShopModule
  ],
  controllers: [AppController, OAuthController, OAuthController],
  providers: [AppService, OAuthService, OAuthService],
})
export class AppModule {}