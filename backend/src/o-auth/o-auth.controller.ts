import { Controller, Get, Query, Redirect } from '@nestjs/common';
import { OAuthService } from './o-auth.service';

@Controller('oauth')
export class OAuthController {
  constructor(private readonly oAuthService: OAuthService) {}

  // Endpoint para gerar a URL de autorização
  @Get('authorize')
  @Redirect()
  getAuthorizationUrl(@Query('state') state: string) {
    const url = this.oAuthService.getAuthorizationUrl(state);
    return { url };
  }

  // Callback para trocar o código de autorização pelo token
  @Get('callback')
  async handleCallback(@Query('code') code: string) {
    const accessToken = await this.oAuthService.getAccessToken(code);
    return { accessToken };
  }
}
