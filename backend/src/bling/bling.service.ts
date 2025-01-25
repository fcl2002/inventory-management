import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class BlingService {
  private readonly httpClient: AxiosInstance;
  private readonly logger = new Logger(BlingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly oAuthService: AuthService,
  ) {
    const baseUrl = 'https://api.bling.com.br/Api/v3';

    this.httpClient = axios.create({
      baseURL: baseUrl,
      headers: {
        Accept: 'application/json',
      },
    });
  }

  private async setAuthorizationHeader(): Promise<void> {
    this.logger.log('[BlingService] Verificando validade do token...');
    await this.oAuthService.ensureValidAccessToken();

    const token = await this.oAuthService.getCurrentAccessToken();
    this.logger.log(`[BlingService] Usando token atualizado: ${token}`);
    this.httpClient.defaults.headers.common['Authorization'] =
      `Bearer ${token}`;
  }

  private logError(context: string, error: any): void {
    const status = error.response?.status || 'Unknown';
    const message =
      error.response?.data?.mensagem || error.message || 'Erro desconhecido';
    this.logger.error(`[${context}] ${message} (Status: ${status})`);
  }

  async getProducts(page: number = 1): Promise<any> {
    await this.setAuthorizationHeader();
    try {
      const response = await this.httpClient.get('/produtos', {
        params: { page },
      });
      const products = response.data.data;

      if (!products || products.length === 0) {
        this.logger.warn(`Nenhum produto encontrado na página ${page}`);
        return [];
      }

      this.logger.log(`Produtos encontrados: ${products.length}`);
      return products;
    } catch (error) {
      this.logError('getProducts', error);
      throw new HttpException(
        'Erro ao buscar produtos na API do Bling',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getProductById(id: number): Promise<any> {
    await this.setAuthorizationHeader();
    try {
      const response = await this.httpClient.get(`/produtos/${id}`);
      return response.data;
    } catch (error) {
      this.logError('getProductById', error);
      throw new HttpException(
        'Erro ao buscar produto por ID',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async syncProducts(): Promise<void> {
    let page = 1;
    let products;
    let totalProcessed = 0;
    const limitPerPage = 100;

    await this.setAuthorizationHeader(); // Isso já aciona o refresh se necessário

    this.logger.log(
      '[Teste] Forçando falha de autenticação para testar o refresh...',
    );
    this.httpClient.defaults.headers.common['Authorization'] =
      'Bearer token_invalido';

    do {
      this.logger.log(`Sincronizando página ${page}...`);
      products = await this.getProducts(page);

      if (!products || products.length === 0) {
        this.logger.log('Nenhum produto encontrado.');
        break;
      }

      for (const product of products) {
        const data = {
          bling_id: parseInt(product.id, 10),
          name: product.nome || 'SEM NOME',
          code: product.codigo || 'SEM CÓDIGO',
          price: parseFloat(product.preco || '0.0'),
          stock: product.estoque.saldoVirtualTotal || 0,
          image_url: product.imagemURL || 'SEM IMAGEM',
        };

        await this.prisma.product.upsert({
          where: { bling_id: data.bling_id },
          update: { ...data },
          create: { ...data },
        });
      }

      totalProcessed += products.length;

      if (products.length < limitPerPage) {
        this.logger.log('Todos os produtos foram processados.');
        break;
      }

      page++;
    } while (true);

    this.logger.log('Sincronização de produtos concluída.');
  }

  @Cron(CronExpression.EVERY_MINUTE) // sincronização a cada 10 segundos
  async handleCron() {
    const currentHour = new Date().getHours();

    if (currentHour >= 8 && currentHour < 24) {
      this.logger.log(
        `[BlingService] Iniciando sincronização... [${currentHour}h]`,
      );
      const token = await this.oAuthService.ensureValidAccessToken();
      this.logger.log(`[BlingService] Token válido utilizado: ${token}`);

      try {
        await this.syncProducts();
      } catch (error) {
        this.logger.error(
          '[BlingService] Erro ao sincronizar produtos.',
          error,
        );
      }
    } else {
      this.logger.log(
        '[BlingService] Fora do horário de sincronização [8h-24h].',
      );
    }
  }
}
