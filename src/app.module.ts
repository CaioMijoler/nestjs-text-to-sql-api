import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QueryController } from './modules/query/query.controller';
import { QueryService } from './modules/query/query.service';
import { DatabaseService } from './modules/database/database.service';
import { LangchainService } from './modules/ai/langchain.service';
import { RedisService } from './modules/cache/redis.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [QueryController],
  providers: [QueryService, DatabaseService, LangchainService, RedisService],
})
export class AppModule {}
