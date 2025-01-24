import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() data: { name: string; email: string; password: string; shopId: number; }) {
    return this.userService.createUser(data);
  }

  @Get()
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(Number(id));
  }

  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() data: { name?: string; shopId?: number }) {
    return this.userService.updateUser(Number(id), data);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(Number(id));
  }
}