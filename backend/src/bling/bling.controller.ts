import { Controller, Get, Post, Param, HttpException, HttpStatus, Query } from '@nestjs/common';
import { BlingService } from './bling.service';

@Controller('bling')
export class BlingController {
  constructor(private readonly blingService: BlingService) {}

  @Get('produtos')
  async getProducts(@Query('page') page: number) {
    return this.blingService.getProducts(page || 1);
  }

  @Get('produtos/:id')
  async getProductById(@Param('id') id: string) {
    const productId = parseInt(id, 10); // Converte o ID para número
    console.log("id:", id);
    if (isNaN(productId)) {
      throw new HttpException('ID inválido', HttpStatus.BAD_REQUEST);
    }
    return this.blingService.getProductById(productId);
  }

  @Post('sync-products')
  async syncProducts() {
    await this.blingService.syncProducts();
    return { message: 'Sincronização concluída com sucesso.' };
  }
}
