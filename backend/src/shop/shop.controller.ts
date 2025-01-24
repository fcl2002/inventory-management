import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { ShopService } from './shop.service';

@Controller('shop')
export class ShopController {
constructor(private readonly userService: ShopService) {}

  @Post()
  async createUser(@Body() data: { name: string; acronym: string; city: string; userId: number; products: [] }) {
    return this.userService.createShop(data);
  }

  @Get()
  async getAllUsers() {
    return this.userService.getAllShops();
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.getShopById(Number(id));
  }

  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() data: { name?: string; shopId?: number }) {
    return this.userService.updateShop(Number(id), data);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteShop(Number(id));
  }
}


