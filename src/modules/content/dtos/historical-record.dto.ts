import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

import { DtoValidation } from '@/modules/core/decorators';

@DtoValidation({ type: 'query' })
export class QueryHistoricalRecordsDto {
    @ApiProperty({
        description: '任务ID',
    })
    @IsUUID(undefined, { always: true, message: '任务ID格式错误' })
    @IsOptional()
    task?: string;
}

/**
 * 历史记录创建验证
 */
@DtoValidation({ groups: ['create'] })
export class CreateHistoricalRecordkDto {
    @ApiProperty({ description: '历史记录内容' })
    @IsNotEmpty({ groups: ['create'], message: '历史记录内容必须填写' })
    @IsOptional({ groups: ['update'] })
    body!: string;

    @ApiPropertyOptional({
        description: '创建人',
        type: String,
    })
    //    TODO 判断用户是否存在
    @IsUUID(undefined, {
        always: true,
        message: 'user does not exist',
    })
    @IsOptional({ groups: ['update'] })
    creator?: string;

    @ApiProperty({
        description: '任务ID',
    })
    @IsUUID(undefined, { always: true, message: '任务ID格式错误' })
    @IsOptional({ groups: ['update'] })
    task?: string;
}
