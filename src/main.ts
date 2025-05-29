import * as helmet from 'helmet';
import { json, urlencoded } from 'express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { envs } from './config/envs';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        cors: true,
    });

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        })
    );
    app.setGlobalPrefix(envs.node.prefix);
    app.enableCors();
    app.enableVersioning({
        type: VersioningType.URI,
    });
    app.use(helmet.contentSecurityPolicy());
    app.use(helmet.crossOriginEmbedderPolicy());
    app.use(helmet.crossOriginOpenerPolicy());
    app.use(helmet.crossOriginResourcePolicy());
    app.use(helmet.dnsPrefetchControl());
    app.use(helmet.expectCt());
    app.use(helmet.frameguard());
    app.use(helmet.hidePoweredBy());
    app.use(helmet.hsts());
    app.use(helmet.ieNoOpen());
    app.use(helmet.noSniff());
    app.use(helmet.originAgentCluster());
    app.use(helmet.permittedCrossDomainPolicies());
    app.use(helmet.referrerPolicy());
    app.use(helmet.xssFilter());
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));
    const logger = new Logger('bootstrap');
    const configSw = new DocumentBuilder()
        .setTitle('API BASE STARTUP CELL')
        .setDescription('Documentación de la API de la célula Statups')
        .setVersion('1.0')
        .addTag('GUX, STARTUPS')
        .addBasicAuth()
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, configSw);
    SwaggerModule.setup('docs', app, document);

    await app.listen(envs.node.port);
    logger.log(`Server running on ${envs.node.api_uri}`);
    logger.log(`See the documentation in ${envs.node.api_uri}/docs`);
}
bootstrap();
