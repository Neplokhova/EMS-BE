import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { Event } from './events/entities/event.entity';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => {
        const host = config.get<string>('DB_HOST') ?? 'localhost';
        const portStr = config.get<string>('DB_PORT') ?? '5432';
        const username = config.get<string>('DB_USER') ?? 'postgres';
        const password = config.get<string>('DB_PASS') ?? 'postgres';
        const database = config.get<string>('DB_NAME') ?? 'ems';

        const port = Number.parseInt(portStr, 10);

        return {
          type: 'postgres',
          host,
          port: Number.isFinite(port) ? port : 5432,
          username,
          password,
          database,
          entities: [Event],
          synchronize: true,
        };
      },
    }),

    EventsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
