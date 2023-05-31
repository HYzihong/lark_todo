import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsDefined,
    IsNotEmpty,
    IsOptional,
    IsUUID,
    MaxLength,
    ValidateIf,
    IsNumber,
    Min,
} from 'class-validator';
import { toNumber } from 'lodash';

import { DtoValidation } from '@/modules/core/decorators';
import { IsDataExist } from '@/modules/database/constraints';
import { PaginateOptions } from '@/modules/database/types';

import { CommentEntity } from '../entities';

/**
 * 评论分页查询验证
 */
@DtoValidation({ type: 'query' })
export class QueryCommentDto implements PaginateOptions {
    @ApiProperty({
        description: '任务ID',
    })
    @IsUUID(undefined, { always: true, message: '任务ID格式错误' })
    @IsOptional()
    task?: string;

    @ApiPropertyOptional({
        description: '当前页',
        type: Number,
        minimum: 1,
        default: 1,
    })
    @Transform(({ value }) => toNumber(value))
    @Min(1, { message: '当前页必须大于1' })
    @IsNumber()
    @IsOptional()
    page = 1;

    @ApiPropertyOptional({
        description: '每页最大显示数',
        type: Number,
        minimum: 1,
        default: 10,
    })
    @Transform(({ value }) => toNumber(value))
    @Min(1, { message: '每页显示数据必须大于1' })
    @IsNumber()
    @IsOptional()
    limit = 10;
}

/**
 * 评论树查询
 */
@DtoValidation({ type: 'query' })
export class QueryCommentTreeDto extends PickType(QueryCommentDto, ['task']) {}

/**
 * 评论添加验证
 */
@DtoValidation()
export class CreateCommentDto {
    @ApiProperty({ description: '评论内容' })
    @MaxLength(1000, { message: '评论内容不能超过$constraint1个字' })
    @IsNotEmpty({ message: '评论内容不能为空' })
    body!: string;

    @ApiPropertyOptional({
        description: '任务 ID',
        type: String,
    })
    @IsUUID(undefined, { always: true, message: '任务ID格式错误' })
    @IsDefined({ message: '评论任务ID必须指定' })
    task!: string;

    @ApiPropertyOptional({
        description: '父评论 ID',
        type: String,
    })
    @IsDataExist(CommentEntity, { message: '父评论不存在' })
    @IsUUID(undefined, { message: '父评论ID格式不正确' })
    @ValidateIf((value) => value.parent !== null && value.parent)
    @IsOptional()
    @Transform(({ value }) => (value === 'null' ? null : value))
    parent?: string;

    @ApiPropertyOptional({
        description: '创建人 ID',
        type: String,
    })
    //    TODO 判断用户是否存在
    @IsUUID(undefined, {
        always: true,
        message: 'user does not exist',
    })
    @IsOptional()
    creator?: string;
}
