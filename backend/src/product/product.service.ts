import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ProdutoCreateInput) {
    return this.prisma.produto.create({ data });
  }

  async findAll() {
    return this.prisma.produto.findMany();
  }

  async findOne(id: string) {
    return this.prisma.produto.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.ProdutoUpdateInput) {
    return this.prisma.produto.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.produto.delete({ where: { id } });
  }
}

