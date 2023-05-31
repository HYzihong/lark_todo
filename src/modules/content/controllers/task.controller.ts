import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    SerializeOptions,
} from '@nestjs/common';

import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { DeleteWithTrashDto, RestoreDto } from '@/modules/restful/dtos';

import { CreatByUserIdsDto, CreateTaskDto, QueryTaskDto, UpdateTaskDto } from '../dtos';
import { PostService } from '../services';

@ApiTags('任务管理')
@Controller('tasks')
export class PostController {
    constructor(protected service: PostService) {}

    @Get()
    @SerializeOptions({ groups: ['task-list'] })
    @ApiOperation({ summary: '查询任务全部' })
    async list(
        @Query()
        options: QueryTaskDto,
    ) {
        return this.service.paginate(options);
    }

    @Get(':id')
    @SerializeOptions({ groups: ['task-detail'] })
    @ApiOperation({ summary: '查询任务详情' })
    async detail(
        @Param('id', new ParseUUIDPipe())
        id: string,
    ) {
        return this.service.detail(id);
    }

    @Post()
    @ApiOperation({ summary: '新增任务' })
    @SerializeOptions({ groups: ['task-detail'] })
    async store(
        @Body()
        data: CreateTaskDto,
    ) {
        return this.service.create(data);
    }

    // 批量新增任务
    @Patch('creatByUserIds')
    @ApiOperation({ summary: '批量新增任务' })
    async(
        @Body()
        data: CreatByUserIdsDto,
    ) {
        return this.service.creatByUserIds(data);
    }

    @Patch()
    @SerializeOptions({ groups: ['task-detail'] })
    @ApiOperation({ summary: '更新任务详情' })
    async update(
        @Body()
        data: UpdateTaskDto,
    ) {
        return this.service.update(data);
    }

    @Delete()
    @SerializeOptions({ groups: ['task-list'] })
    @ApiOperation({ summary: '带软删除的批量删除任务' })
    async delete(
        @Body()
        data: DeleteWithTrashDto,
    ) {
        const { ids, trash } = data;
        return this.service.delete(ids, trash);
    }

    @Patch('restore')
    @SerializeOptions({ groups: ['task-list'] })
    @ApiOperation({ summary: '批量恢复任务' })
    async restore(
        @Body()
        data: RestoreDto,
    ) {
        const { ids } = data;
        return this.service.restore(ids);
    }
}
