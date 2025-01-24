import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: { name: string; email: string; password: string; shopId: number; }) {
    const existingUser = await this.prisma.user.findUnique({ where: {email: data.email }});
    
    if (existingUser) 
      throw new HttpException('E-mail já está em uso', HttpStatus.BAD_REQUEST);

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        shopId: data.shopId || null, // admin não precisa estar associado a uma loja
      },
    })
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      include: {
        shop: true, // Inclui informações do ponto de venda associado
      },
    });
  }

  async getUserById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { shop: true },
    });
  }

  async updateUser(id: number, data: { name?: string; shopId?: number }) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
