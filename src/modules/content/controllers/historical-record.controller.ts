import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateHistoricalRecordkDto } from '../dtos';
import { HistoricalRecordsEntity } from '../entities';
import { HistoricalRecordsService } from '../services/historical-record.service';

@ApiTags('历史记录管理')
@Controller('historical_records')
export class HistoricalRecordsController {
    constructor(protected service: HistoricalRecordsService) {}

    @Post()
    @ApiOperation({ summary: '新增历史记录' })
    async store(
        @Body()
        data: CreateHistoricalRecordkDto,
    ): Promise<HistoricalRecordsEntity> {
        return this.service.create(data);
    }

    @Get('/task/:id')
    @ApiOperation({ summary: '历史记录查询' })
    async searchByName(
        @Param('id')
        id: string,
    ) {
        return this.service.ListByTaskId({ task: id });
    }
}
