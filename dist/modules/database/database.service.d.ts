import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private pool;
    private readonly logger;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    getDatabaseSchema(): Promise<string>;
    executeQuery(sql: string): Promise<any[]>;
}
