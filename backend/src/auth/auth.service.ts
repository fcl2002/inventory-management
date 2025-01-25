import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly tokenUrl: string;
  
  private accessToken: string;
  private refreshToken: string;
  private expiresAt: Date;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.clientId = this.getEnvVariable('BLING_CLIENT_ID');
    this.clientSecret = this.getEnvVariable('BLING_CLIENT_SECRET');
    this.tokenUrl = this.getEnvVariable('BLING_TOKEN_URL');
    
    this.loadTokensFromDatabase();
  }

  private async loadTokensFromDatabase(): Promise<void> {
    try {
      const authToken = await this.prisma.authToken.findUnique({ where: { id: 1 } });
  
      if (authToken) {
        this.accessToken = authToken.accessToken;
        this.refreshToken = authToken.refreshToken;
        this.expiresAt = authToken.expiresAt;
        this.logger.log('[AuthService] Tokens carregados do banco com sucesso.');
      } else {
        this.logger.warn('[AuthService] Nenhum token encontrado no banco. Configure os tokens manualmente.');
      }
    } catch (error) {
      this.logger.error('[AuthService] Erro ao carregar tokens do banco.', error);
      throw new HttpException('Erro ao carregar tokens do banco.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private getEnvVariable(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`Variável de ambiente ${key} não está definida.`);
    }
    return value;
  }

  private encodeClientCredentials(): string {
    return Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
  }

  async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      this.logger.error('[AuthService] O refresh token está ausente.');
      throw new HttpException('Refresh token ausente. Por favor, reautentique.', HttpStatus.UNAUTHORIZED);
    }

    this.logger.log('[AuthService] Tentando renovar o token de acesso...');

    const headers = {
      Authorization: `Basic ${this.encodeClientCredentials()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
    });
    
    try {
      const response: AxiosResponse = await axios.post(this.tokenUrl, body, { headers });
      const { access_token, refresh_token, expires_in } = response.data;

      this.accessToken = access_token;
      this.refreshToken = refresh_token;
      this.expiresAt = new Date(Date.now() + expires_in * 1000); // Calcule o novo tempo de expiração

      await this.prisma.authToken.upsert({
        where: { id: 1 }, // Assumindo que há apenas uma entrada de token
        update: {
            accessToken: this.accessToken,
            refreshToken: this.refreshToken,
            expiresAt: this.expiresAt,
        },
        create: {
            accessToken: this.accessToken,
            refreshToken: this.refreshToken,
            expiresAt: this.expiresAt,
        },
    });

    this.logger.log(`[AuthService] Token de acesso renovado e salvo no banco. Expira em: ${this.expiresAt.toISOString()}`);


    return access_token;
    } catch (error) {
      const errorMessage = error.response?.data || 'Erro ao renovar o token de acesso';
      this.logger.error('[AuthService] Erro ao renovar o token de acesso', errorMessage);
      throw new HttpException(errorMessage, error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async ensureValidAccessToken(): Promise<string> {
    const now = new Date();

    if (!this.expiresAt || now >= this.expiresAt || now >= new Date(this.expiresAt.getTime() - 60 * 1000)) {
      this.logger.warn(`[AuthService] Token expirado ou prestes a expirar. Renovando...`);
      await this.refreshAccessToken();
    } else {
      this.logger.log(`[AuthService] Token válido. Expira em: ${this.expiresAt.toISOString()}`);
    }

    return this.accessToken;
  }

  @Cron(CronExpression.EVERY_HOUR)
  async autorefreshToken(): Promise<void> {
    this.logger.log('[AuthService] Verificando validade do token...');
    await this.ensureValidAccessToken();
  }

  getCurrentAccessToken(): string {
    if (!this.accessToken) {
      throw new HttpException('Nenhum token de acesso disponível.',HttpStatus.UNAUTHORIZED,);
    }
    return this.accessToken;
  }
}
