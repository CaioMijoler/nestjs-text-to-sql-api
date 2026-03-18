"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const query_controller_1 = require("./modules/query/query.controller");
const query_service_1 = require("./modules/query/query.service");
const database_service_1 = require("./modules/database/database.service");
const langchain_service_1 = require("./modules/ai/langchain.service");
const redis_service_1 = require("./modules/cache/redis.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
        ],
        controllers: [query_controller_1.QueryController],
        providers: [query_service_1.QueryService, database_service_1.DatabaseService, langchain_service_1.LangchainService, redis_service_1.RedisService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map