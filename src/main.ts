import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { useContainer } from 'class-validator';

import { AppModule } from './app.module';
import { generateSwaggerDocs } from './config';

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

    app.enableCors();

    useContainer(app.select(AppModule), {
        fallbackOnErrors: true,
    });

    app.setGlobalPrefix('api');

    // 文档
    generateSwaggerDocs(app);

    await app.listen(3100);

    console.log(`
      service url       : http://localhost:3100/api
      service api docs  : http://localhost:3100/api/docs
  `);
}

bootstrap();
