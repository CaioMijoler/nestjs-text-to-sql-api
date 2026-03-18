"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DatabaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mysql = require("mysql2/promise");
let DatabaseService = DatabaseService_1 = class DatabaseService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(DatabaseService_1.name);
    }
    async onModuleInit() {
        try {
            this.pool = mysql.createPool({
                host: this.configService.get('DB_HOST'),
                port: this.configService.get('DB_PORT'),
                user: this.configService.get('DB_USERNAME'),
                password: this.configService.get('DB_PASSWORD'),
                database: this.configService.get('DB_NAME'),
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
                enableKeepAlive: true,
                keepAliveInitialDelay: 10000,
            });
            const connection = await this.pool.getConnection();
            connection.release();
            this.logger.log('Successfully connected to MySQL Database (pool).');
        }
        catch (error) {
            this.logger.error('Error connecting to MySQL Database', error);
            throw error;
        }
    }
    async onModuleDestroy() {
        if (this.pool) {
            await this.pool.end();
        }
    }
    async getDatabaseSchema() {
        const [tables] = await this.pool.execute('SHOW TABLES');
        let schemaDefinition = '';
        for (const row of tables) {
            const tableName = Object.values(row)[0];
            const [columns] = await this.pool.execute(`SHOW COLUMNS FROM \`${tableName}\``);
            schemaDefinition += `Table: ${tableName}\nColumns:\n`;
            for (const col of columns) {
                schemaDefinition += `- ${col.Field} (${col.Type})\n`;
            }
            schemaDefinition += '\n';
        }
        const dbName = this.configService.get('DB_NAME');
        const [fks] = await this.pool.execute(`SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME IS NOT NULL`, [dbName]);
        const fkRows = fks;
        if (fkRows.length > 0) {
            schemaDefinition += 'Relationships:\n';
            for (const fk of fkRows) {
                schemaDefinition += `- ${fk.TABLE_NAME}.${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}\n`;
            }
            schemaDefinition += '\n';
        }
        return schemaDefinition;
    }
    async executeQuery(sql) {
        const [rows] = await this.pool.execute(sql);
        return rows;
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = DatabaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DatabaseService);
//# sourceMappingURL=database.service.js.map