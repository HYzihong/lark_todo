import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import * as packageConfig from '../../package.json';

export const generateSwaggerDocs = async (app: NestFastifyApplication) => {
    const options = new DocumentBuilder()
        .setTitle(packageConfig.name)
        .setDescription(packageConfig.description)
        .setVersion(packageConfig.version)
        .build();

    const document = SwaggerModule.createDocument(app, options);

    SwaggerModule.setup('/api/docs', app, document);
};
