"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const nest_winston_1 = require("nest-winston");
const winston_1 = require("winston");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: nest_winston_1.WinstonModule.createLogger((0, winston_1.createLogger)({
            level: process.env.LOG_LEVEL || 'debug',
            format: winston_1.format.json(),
            transports: [new winston_1.transports.Console()],
        })),
    });
    app.enableCors({
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
        credentials: true,
        methods: ['GET'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
        maxAge: 3600,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({ transform: true }));
    const document = swagger_1.SwaggerModule.createDocument(app, new swagger_1.DocumentBuilder()
        .setTitle(process.env.npm_package_name)
        .setDescription(process.env.npm_package_description)
        .setVersion(process.env.npm_package_version)
        .setContact(process.env.npm_package_description, process.env.npm_package_homepage, process.env.npm_package_author)
        .addBearerAuth()
        .build());
    swagger_1.SwaggerModule.setup('/', app, document);
    await app.listen(process.env.PORT, () => {
        common_1.Logger.log(`Application started on port: ${process.env.PORT}`, 'Bootstrap');
    });
}
bootstrap();
//# sourceMappingURL=main.js.map