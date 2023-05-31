import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * 数据库配置
 */
export const database = (): TypeOrmModuleOptions => ({
    charset: 'utf8mb4',
    logging: ['error'],
    type: 'mysql',
    host: '127.0.0.1',
    port: 3306,
    username: 'root',
    password: 'pass1234',
    database: 'lark_todo',
    synchronize: true,
    autoLoadEntities: true,
});
