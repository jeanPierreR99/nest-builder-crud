import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DynamicModule } from './DynamicModule';
import * as entities from '../entities';
import "dotenv/config";

@Module({
  controllers: [],
  imports: [
    DynamicModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: Object.values(entities),

      synchronize: true,
    }),
  ],
})
export class AppModule {}
