import { Repository } from 'typeorm';

import { CustomRepository } from '@/modules/database/decorators';

import { TaskEntity, CommentEntity } from '../entities';

@CustomRepository(TaskEntity)
export class TaskRepository extends Repository<TaskEntity> {
    buildBaseQB() {
        // 在查询之前先查询出评论数量在添加到commentCount字段上
        return this.createQueryBuilder('task')
            .leftJoinAndSelect('task.categories', 'categories')
            .leftJoinAndSelect(`task.creator`, 'creator')
            .addSelect((subQuery) => {
                return subQuery
                    .select('COUNT(c.id)', 'count')
                    .from(CommentEntity, 'c')
                    .where('c.task.id = task.id');
            }, 'commentCount')
            .loadRelationCountAndMap('task.commentCount', 'task.comments');
    }
}
