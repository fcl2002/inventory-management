import { Controller, Get, Post, Body, Logger, HttpException, HttpStatus, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('oauth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('access-token')
  getCurrentToken() {
    try {
      const token = this.authService.getCurrentAccessToken();
      return { accessToken: token };
    } catch (error) {
      this.logger.error('Erro ao obter o token de acesso atual.', error);
      throw error;
    }
  }

  @Post('initialize')
  async initializeToken(
    @Body('accessToken') accessToken: string,
    @Body('refreshToken') refreshToken: string,
    @Body('expiresIn') expiresIn: number,
  ) {
    if (!accessToken || !refreshToken || !expiresIn) {
      throw new HttpException(
        'Todos os campos são obrigatórios.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    await this.prisma.authToken.upsert({
      where: { id: 1 },
      update: { accessToken, refreshToken, expiresAt, },
      create: { accessToken, refreshToken, expiresAt, },
    });

    this.logger.log('[AuthController] Token inicial criado ou atualizado com sucesso.');
    return { message: 'Token inicial criado ou atualizado com sucesso.' };
  }

  @Post('refresh-token')
  async refreshAccessToken() {
    try {
      const newToken = await this.authService.refreshAccessToken();
      return { message: 'Token renovado com sucesso.', accessToken: newToken };
    } catch (error) {
      this.logger.error('Erro ao renovar o token de acesso.', error);
      throw error;
    }
  }
}
