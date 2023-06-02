import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsBoolean,
    IsDateString,
    IsDefined,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsUUID,
    MaxLength,
    Min,
    ValidateIf,
} from 'class-validator';

import { isNil, toNumber } from 'lodash';

import { DtoValidation } from '@/modules/core/decorators';
import { toBoolean } from '@/modules/core/helpers';

import { SelectTrashMode } from '@/modules/database/constants';
import { IsDataExist } from '@/modules/database/constraints';
import { PaginateOptions } from '@/modules/database/types';

import { ReminderOrderType, TaskOrderType } from '../constants';
import { CategoryEntity } from '../entities';

/**
 * 任务分页查询验证
 */
@DtoValidation({ type: 'query' })
export class QueryTaskDto implements PaginateOptions {
    @IsEnum(SelectTrashMode)
    @IsOptional()
    trashed?: SelectTrashMode;

    @ApiPropertyOptional({
        description: '分类ID',
    })
    @IsDataExist(CategoryEntity, {
        message: '指定的分类不存在',
    })
    @IsUUID(undefined, { message: '分类ID格式错误' })
    @IsOptional()
    category?: string;

    @ApiPropertyOptional({
        description: '任务是否已完成',
    })
    @Transform(({ value }) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;

    @ApiPropertyOptional({
        description: '排序规则',
        enum: TaskOrderType,
    })
    @IsEnum(TaskOrderType, {
        message: `排序规则必须是${Object.values(TaskOrderType).join(',')}其中一项`,
    })
    @IsOptional()
    orderBy?: TaskOrderType;

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
 * 任务创建验证
 */
@DtoValidation({ groups: ['create'] })
export class CreateTaskDto {
    @ApiProperty({ description: '房屋详情标题', maxLength: 255 })
    @MaxLength(255, {
        always: true,
        message: '任务标题长度最大为$constraint1',
    })
    @IsNotEmpty({ groups: ['create'], message: '任务标题必须填写' })
    @IsOptional({ groups: ['update'] })
    title!: string;

    @ApiProperty({ description: '任务内容' })
    @IsNotEmpty({ groups: ['create'], message: '任务内容必须填写' })
    @IsOptional({ groups: ['update'] })
    body!: string;

    /**
     * 完成时间
     */
    @ApiPropertyOptional({
        description: '完成时间',
        type: Date,
    })
    @IsDateString()
    @IsOptional({ always: true })
    @ValidateIf((value) => !isNil(value.publishedAt))
    @Transform(({ value }) => (value === 'null' ? null : value))
    publishedAt?: Date;

    /**
     * 执行时间
     */
    @ApiPropertyOptional({
        description: '执行时间',
        type: Date,
    })
    @IsDateString()
    @IsOptional({ always: true })
    @ValidateIf((value) => !isNil(value.publishedAt))
    @Transform(({ value }) => (value === 'null' ? null : value))
    executionAt!: Date;

    /**
     * 提醒时间
     */
    @ApiPropertyOptional({
        description: '提醒时间',
        enum: ReminderOrderType,
        default: null,
    })
    @IsEnum(ReminderOrderType, {
        message: `the gender type must be one of ${Object.values(ReminderOrderType).join(
            ',',
        )}其中一项`,
    })
    @IsOptional()
    eminderTime?: ReminderOrderType;

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

    @ApiPropertyOptional({
        description: '创建人',
        type: String,
    })
    //    TODO 判断用户是否存在
    @IsUUID(undefined, {
        always: true,
        message: 'user does not exist',
    })
    @IsOptional({ always: true })
    executor?: string;

    @ApiProperty({
        description: '任务的父ID',
    })
    @IsUUID(undefined, { message: '任务ID格式错误' })
    @IsDefined({ message: '任务ID必须指定' })
    parent: string;

    @ApiPropertyOptional({
        description: '分类',
        type: String,
    })
    @IsDataExist(CategoryEntity, {
        each: true,
        always: true,
        message: '分类不存在',
    })
    @IsUUID(undefined, {
        each: true,
        always: true,
        message: '分类ID格式不正确',
    })
    @IsOptional({ always: true })
    categories?: string[];
}

/**
 * 任务更新验证
 */
@DtoValidation({ groups: ['update'] })
export class UpdateTaskDto extends PartialType(CreateTaskDto) {
    @ApiProperty({
        description: '待更新的任务ID',
    })
    @IsUUID(undefined, { groups: ['update'], message: '任务ID格式错误' })
    @IsDefined({ groups: ['update'], message: '任务ID必须指定' })
    id!: string;
}

export class CreatByUserIdsDto {
    @ApiProperty({
        description: '待新增的用户ID列表',
    })
    @IsUUID(undefined, {
        each: true,
        message: 'ID格式错误',
    })
    @IsDefined({
        each: true,
        message: 'ID必须指定',
    })
    ids: string[] = [];

    @ApiProperty({
        description: '待新增的任务ID',
    })
    @IsUUID(undefined, { message: '任务ID格式错误' })
    @IsDefined({ message: '任务ID必须指定' })
    task: string;
}
