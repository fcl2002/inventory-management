import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from '../auth/enums/role.enum';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto) {
    const {
      userEmail,
      userPassword,
      userName,
      shopName,
      shopAcronym,
      shopCity,
    } = createUserDto;

    const existingShop = await this.prisma.shop.findFirst({
      where: {
        OR: [{ name: shopName }, { acronym: shopAcronym }],
      },
    });

    if (existingShop) {
      if (existingShop.name === shopName)
        throw new HttpException('Nome já está em uso!', HttpStatus.BAD_REQUEST);
      else
        throw new HttpException(
          'Sigla já está em uso!',
          HttpStatus.BAD_REQUEST,
        );
    }

    return this.prisma.$transaction(async (prisma) => {
      const shop = await prisma.shop.create({
        data: {
          name: shopName,
          acronym: shopAcronym,
          city: shopCity,
        },
      });

      const existingUser = await this.prisma.user.findUnique({
        where: { email: userEmail },
      });
      if (existingUser) {
        throw new HttpException(
          'E-mail já está em uso',
          HttpStatus.BAD_REQUEST,
        );
      }

      const hashedPassword = await bcrypt.hash(userPassword, 10);

      return prisma.user.create({
        data: {
          email: userEmail,
          password: hashedPassword,
          name: userName,
          role: UserRole.USER,
          shop: {
            connect: { id: shop.id },
          },
        },
      });
    });
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      include: {
        shop: true,
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
