import { TypeOrmModule } from '@nestjs/typeorm';
import * as controllers from '../controllers';
import * as services from '../services'; 
import * as entities from '../entities';
import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature(Object.values(entities))],
  controllers: Object.values(controllers),
  providers: Object.values(services),
})
export class DynamicModule {}
