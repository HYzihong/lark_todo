import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsUUID } from 'class-validator';

import { DtoValidation } from '@/modules/core/decorators';

/**
 * 批量删除验证
 */
@DtoValidation()
export class DeleteDto {
    @ApiProperty({
        description: '待删除的用户ID列表',
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
}
