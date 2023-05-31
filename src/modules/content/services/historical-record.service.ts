import { Injectable } from '@nestjs/common';

import { QueryHistoricalRecordsDto } from '../dtos/historical-record.dto';
import { HistoricalRecordsEntity } from '../entities';
import { HistoricalRecordsRepository } from '../repositories';

/**
 * 分类数据操作
 */
@Injectable()
export class HistoricalRecordsService {
    constructor(protected repository: HistoricalRecordsRepository) {}

    /**
     * 新增 历史记录
     */
    async create(date: any): Promise<HistoricalRecordsEntity> {
        return this.repository.save(date);
    }

    /**
     * 通过taskid 获取 历史记录
     * @param task id
     */
    async ListByTaskId(data: QueryHistoricalRecordsDto): Promise<HistoricalRecordsEntity[]> {
        return this.repository.find({
            where: { task: { id: data.task } },
            relations: { creator: true },
        });
    }
}
