import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { BlingModule } from './bling/bling.module';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
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
    AuthModule,
    ShopModule,
  ],
  controllers: [AppController, AuthController, AuthController],
  providers: [AppService, AuthService, AuthService],
})
export class AppModule {}
