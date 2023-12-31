import { NestFactory } from '@nestjs/core';
import 'dotenv/config';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(parseInt(process.env.APP_PORT));
}
bootstrap();
