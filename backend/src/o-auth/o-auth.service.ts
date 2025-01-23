import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly tokenUrl: string;
  
  private accessToken: string;
  private refreshToken: string;

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.getEnvVariable('BLING_CLIENT_ID');
    this.clientSecret = this.getEnvVariable('BLING_CLIENT_SECRET');
    this.redirectUri = this.getEnvVariable('BLING_REDIRECT_URI');
    this.tokenUrl = this.getEnvVariable('BLING_TOKEN_URL');
    this.accessToken = this.getEnvVariable('BLING_ACCESS_TOKEN');   // Token inicial
    this.refreshToken = this.getEnvVariable('BLING_REFRESH_TOKEN'); // Refresh token inicial
  }

  private getEnvVariable(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`Environment variable ${key} is not defined.`);
    }
    return value;
  }

  getAuthorizationUrl(state: string): string {
    const authUrl = this.configService.get<string>('BLING_AUTH_URL');
    const scope = 'read write'; // Defina os escopos necessários para sua aplicação
    return `${authUrl}?response_type=code&client_id=${this.clientId}&redirect_uri=${this.redirectUri}&scope=${scope}&state=${state}`;
  }

  async getAccessToken(authorizationCode: string): Promise<string> {
    try {
      const response: AxiosResponse = await axios.post(this.tokenUrl, {
        grant_type: 'authorization_code',
        code: authorizationCode,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      });

      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;

      this.logger.log('Novo token de acesso obtido com sucesso!');
      return response.data.access_token;
    } catch (error) {
        this.logger.error('Erro ao obter o token de acesso', error);
        throw new HttpException(
          error.response?.data || 'Erro ao obter o token de acesso',
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
  }

  async refreshAccessToken(): Promise<string> {
    try {
      const response: AxiosResponse = await axios.post(this.tokenUrl, {
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      });

      this.accessToken = response.data.access_token; // Atualiza o access token
      this.refreshToken = response.data.refresh_token; // Atualiza o refresh token

      this.logger.log('Access token atualizado com sucesso!');
      return response.data.access_token;
    } catch (error) {
        this.logger.error('Erro ao atualizar o token de acesso', error);
        throw new HttpException(
          error.response?.data || 'Erro ao atualizar o token de acesso',
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
  }

  async ensureValidAccessToken(): Promise<void> {
    if (!this.accessToken) {
      this.logger.warn('Access token ausente ou expirado. Atualizando...');
      await this.refreshAccessToken();
    }
  }

  getCurrentAccessToken(): string {
    return this.accessToken;
  }
}
