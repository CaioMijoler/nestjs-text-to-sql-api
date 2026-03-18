import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mysql from 'mysql2/promise';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: mysql.Pool;
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    try {
      this.pool = mysql.createPool({
        host: this.configService.get<string>('DB_HOST'),
        port: this.configService.get<number>('DB_PORT'),
        user: this.configService.get<string>('DB_USERNAME'),
        password: this.configService.get<string>('DB_PASSWORD'),
        database: this.configService.get<string>('DB_NAME'),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
      });

      const connection = await this.pool.getConnection();
      connection.release();
      this.logger.log('Successfully connected to MySQL Database (pool).');
    } catch (error) {
      this.logger.error('Error connecting to MySQL Database', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
    }
  }

  async getDatabaseSchema(): Promise<string> {
    const [tables] = await this.pool.execute('SHOW TABLES');
    let schemaDefinition = '';

    for (const row of tables as any[]) {
      const tableName = Object.values(row)[0] as string;
      const [columns] = await this.pool.execute(`SHOW COLUMNS FROM \`${tableName}\``);
      schemaDefinition += `Table: ${tableName}\nColumns:\n`;
      for (const col of columns as any[]) {
        schemaDefinition += `- ${col.Field} (${col.Type})\n`;
      }
      schemaDefinition += '\n';
    }

    // Append foreign key relationships from INFORMATION_SCHEMA
    const dbName = this.configService.get<string>('DB_NAME');
    const [fks] = await this.pool.execute(
      `SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME IS NOT NULL`,
      [dbName],
    );

    const fkRows = fks as any[];
    if (fkRows.length > 0) {
      schemaDefinition += 'Relationships:\n';
      for (const fk of fkRows) {
        schemaDefinition += `- ${fk.TABLE_NAME}.${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}\n`;
      }
      schemaDefinition += '\n';
    }

    return schemaDefinition;
  }

  async executeQuery(sql: string): Promise<any[]> {
    const [rows] = await this.pool.execute(sql);
    return rows as any[];
  }
}
