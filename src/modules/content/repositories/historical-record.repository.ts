import { Repository, SelectQueryBuilder } from 'typeorm';

import { CustomRepository } from '@/modules/database/decorators';

import { HistoricalRecordsEntity } from '../entities';

@CustomRepository(HistoricalRecordsEntity)
export class HistoricalRecordsRepository extends Repository<HistoricalRecordsEntity> {
    /**
     * 构建基础查询器
     */
    buildBaseQB(
        qb: SelectQueryBuilder<HistoricalRecordsEntity>,
    ): SelectQueryBuilder<HistoricalRecordsEntity> {
        return qb
            .leftJoinAndSelect(`record.creator`, 'creator')
            .leftJoinAndSelect(`record.task`, 'task')
            .orderBy('comment.createdAt', 'ASC');
    }
}
