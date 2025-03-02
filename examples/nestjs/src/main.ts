/* eslint-disable @typescript-eslint/no-unused-vars */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpsEnabler } from '@https-enable/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import {
  NestJsFastifyHttpsAdapter,
  NestJsExpressHttpsAdapter,
} from '@https-enable/adapter-nestjs';

async function bootstrap() {
  // const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const adapter = new NestJsFastifyHttpsAdapter(app);

  const enabler = new HttpsEnabler({
    adapter,
    options: { host: '127.0.0.1', port: process.env.PORT ?? 3000 },
    certificateOptions: { validity: 1, domains: '127.0.0.1', base: 'cert' },
  });

  await enabler.startServer().then((res) => {
    console.log(`Server running in http://${res.host}:${res.port}`);
  });
}
void bootstrap();
