import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BlingService {
  private readonly httpClient: AxiosInstance;
  private readonly logger = new Logger(BlingService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService  
  ) {
    const baseUrl = 'https://api.bling.com.br/Api/v3';
    const token = this.configService.get<string>('BLING_ACCESS_TOKEN');

    this.httpClient = axios.create({
      baseURL: baseUrl,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getProducts(page: number = 1): Promise<any> {
    try {
      const response = await this.httpClient.get('/produtos', {
        params: { page },
      });
      return response.data.retorno.produtos.map((prod: any) => prod.produto); // Ajuste para o formato da API
    } catch (error) {
        this.logger.error(`Erro ao buscar produtos: ${error.message}`);
        throw new HttpException(
        error.response?.data || 'Erro ao conectar à API do Bling',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async syncProducts(): Promise<void> {
    let page = 1;
    let products;

    do {
      this.logger.log(`Sincronizando página ${page}...`);
      // Busca os produtos da API do Bling
      products = await this.getProducts(page);

      for (const product of products) {
        const blingId = parseInt(product.id, 10); // Converte o ID para número
        const data = {
          bling_id: blingId,
          name: product.descricao || 'Sem descrição',
          code: parseInt(product.codigo || '0', 10),
          price: parseFloat(product.preco || '0.0'),
          stock: product.estoque?.[0]?.quantidade || 0, // Estoque do primeiro depósito
          image_url: product.imagem || '', // URL da imagem
        };

        // Atualiza ou insere o produto no banco
        await this.prisma.product.upsert({
          where: { bling_id: blingId },
          update: { ...data },
          create: { ...data },
        });
      }

      page++;
    } while (products.length > 0); // Continua até que não haja mais produtos na API

    this.logger.log('Sincronização de produtos concluída.');
  }

  async getProductById(id: number): Promise<any> {
    try {
      const response = await this.httpClient.get(`/produtos/${id}`);
      return response.data;
    } catch (error) {
        this.logger.error(`Erro ao buscar produto com ID ${id}: ${error.message}`);
        throw new HttpException(
        error.response?.data || 'Erro ao conectar à API do Bling',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

