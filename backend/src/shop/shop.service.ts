import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShopService {
  constructor(private readonly prisma: PrismaService) {}

  async createShop(data: { name: string; acronym: string; city: string; userId?: number }) {
    const existingShop = await this.prisma.shop.findFirst({
      where: {
        OR: [{ name: data.name }, { acronym: data.acronym }], // criar lógica para capturar a sigla
      },
    });
    if (existingShop) {
      throw new HttpException('Nome ou acrônimo já está em uso', HttpStatus.BAD_REQUEST);
    }

    return this.prisma.shop.create({
      data: {
        name: data.name,
        acronym: data.acronym,
        city: data.city,
        userId: data.userId || null, // associa o admin, se fornecido
      },
    });
  }

  async getAllShops() {
    return this.prisma.shop.findMany({
      include: { user: true }, // incluir informações do usuário associado
    });
  }

  async getShopById(id: number) {
    return this.prisma.shop.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async updateShop(id: number, data: { name?: string; acronym?: string; city?: string }) {
    return this.prisma.shop.update({
      where: { id },
      data,
    });
  }

  async deleteShop(id: number) {
    return this.prisma.shop.delete({
      where: { id },
    });
  }
}
