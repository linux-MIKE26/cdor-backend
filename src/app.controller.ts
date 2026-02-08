import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  root() {
    return {
      status: 'ok',
      message: 'OAuth login successful',
    };
  }

  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
