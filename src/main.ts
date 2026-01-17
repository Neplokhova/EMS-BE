import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

import type { Request, Response, NextFunction } from 'express';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const origin = 'http://localhost:3000';

  app.enableCors({
    origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  });

  // ✅ типобезпечний handler для preflight (OPTIONS)
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Origin', origin);
      res.header(
        'Access-Control-Allow-Methods',
        'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      );
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.header('Access-Control-Allow-Credentials', 'true');
      return res.sendStatus(204);
    }

    return next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const portRaw = process.env.PORT;
  const port = portRaw ? Number.parseInt(portRaw, 10) : 5000;

  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`✅ CORS enabled for ${origin}`);
}

bootstrap().catch((err) => {
  console.error('❌ Bootstrap error:', err);
  process.exit(1);
});
