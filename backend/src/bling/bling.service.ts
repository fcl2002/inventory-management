import { Injectable, HttpException, HttpStatus, Logger, Param } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BlingService {
  private readonly httpClient: AxiosInstance;
  private readonly logger = new Logger(BlingService.name);

  constructor(private readonly configService: ConfigService) {
    const baseUrl = this.configService.get<string>('BLING_BASE_URL', 'https://api.bling.com.br/Api/v3');
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
      return response.data;
    } catch (error) {
        this.logger.error(`Erro ao buscar produtos: ${error.message}`);
        throw new HttpException(
        error.response?.data || 'Erro ao conectar à API do Bling',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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

