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

    this.httpClient = axios.create({
      baseURL: baseUrl,
      headers: {
        Accept: 'application/json',
      },
    });
  }

  private async ensureAuthorizationHeader(): Promise<void> {
    const token = this.configService.get<string>('BLING_ACCESS_TOKEN');
    this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  private logError(context: string, error: any): void {
    const status = error.response?.status || 'Unknown';
    const message = error.response?.data?.mensagem || error.message || 'Erro desconhecido';
    this.logger.error(`[${context}] ${message} (Status: ${status})`);
  }

  async getProducts(page: number = 1): Promise<any> {
    await this.ensureAuthorizationHeader();
    try {
      const response = await this.httpClient.get('/produtos', { params: { page } });
      const products = response.data.data;

      if (!products || products.length === 0) {
        this.logger.warn(`Nenhum produto encontrado na página ${page}`);
        return [];
      }
  
      this.logger.log(`Produtos encontrados: ${products.length}`);
      return products;
    } catch (error) {
      this.logError('getProducts', error);
      throw new HttpException('Erro ao buscar produtos na API do Bling', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async syncProducts(): Promise<void> {
    let page = 1;
    let products;

    do {
      this.logger.log(`Sincronizando página ${page}...`);
      products = await this.getProducts(page);

      if (!products || products.length === 0) break;

      for (const product of products) {
        const data = {
          bling_id: parseInt(product.id, 10),
          name: product.descricao || 'Sem descrição',
          code: parseInt(product.codigo || '0', 10),
          price: parseFloat(product.preco || '0.0'),
          stock: product.estoque?.[0]?.quantidade || 0,
          image_url: product.imagem || '',
        };

        await this.prisma.product.upsert({
          where: { bling_id: data.bling_id },
          update: { ...data },
          create: { ...data },
        });
      }

      page++;
    } while (products.length > 0);

    this.logger.log('Sincronização de produtos concluída.');
  }

  async getProductById(id: number): Promise<any> {
    await this.ensureAuthorizationHeader();
    try {
      const response = await this.httpClient.get(`/produtos/${id}`);
      return response.data;
    } catch (error) {
      this.logError('getProductById', error);
      throw new HttpException('Erro ao buscar produto por ID', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

