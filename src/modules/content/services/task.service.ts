import { Injectable } from '@nestjs/common';

import { isArray, isFunction, isNil, omit } from 'lodash';

import { In, IsNull, Not, SelectQueryBuilder, EntityNotFoundError } from 'typeorm';

import { SelectTrashMode } from '@/modules/database/constants';
import { paginate } from '@/modules/database/helpers';
import { QueryHook } from '@/modules/database/types';

import { TaskOrderType } from '../constants';
import { CreatByUserIdsDto, CreateTaskDto, QueryTaskDto, UpdateTaskDto } from '../dtos';

import { TaskEntity } from '../entities/task.entity';
import { CategoryRepository } from '../repositories/category.repository';
import { TaskRepository } from '../repositories/task.repository';

import { CategoryService } from './category.service';
import { CommentService } from './comment.service';
import { HistoricalRecordsService } from './historical-record.service';
import { UserService } from './user.service';

// 任务查询接口
type FindParams = {
    [key in keyof Omit<QueryTaskDto, 'limit' | 'page'>]: QueryTaskDto[key];
};

/**
 * 类转义为普通对象后的类型
 */
export type ClassToPlain<T> = { [key in keyof T]: T[key] };

/**
 * 任务数据操作
 */
@Injectable()
export class PostService {
    constructor(
        protected repository: TaskRepository,
        protected categoryRepository: CategoryRepository,
        protected categoryService: CategoryService,
        protected userService: UserService,
        protected commentService: CommentService,
        protected historicalRecordsService: HistoricalRecordsService,
    ) {}

    /**
     * 获取分页数据
     * @param options 分页选项
     * @param callback 添加额外的查询
     */
    async paginate(options: QueryTaskDto, callback?: QueryHook<TaskEntity>) {
        const qb = await this.buildListQuery(this.repository.buildBaseQB(), options, callback);
        return paginate(qb, options);
    }

    /**
     * 查询单篇任务
     * @param id
     * @param callback 添加额外的查询
     */
    async detail(id: string, callback?: QueryHook<TaskEntity>) {
        let qb = this.repository.buildBaseQB();
        qb.where(`task.id = :id`, { id });
        qb = !isNil(callback) && isFunction(callback) ? await callback(qb) : qb;
        const item = await qb.getOne();
        if (!item) throw new EntityNotFoundError(TaskEntity, `The task ${id} not exists!`);
        return item;
    }

    /**
     * 创建任务
     * @param data
     */
    async create(data: CreateTaskDto) {
        // console.log('task create ==>', data);

        const createUser = await this.userService.findById(data.creator);
        const executorUser = !isNil(data.executor)
            ? await this.userService.findById(data.executor)
            : createUser;

        const taskTemp = {
            ...data,
            categories: isArray(data.categories)
                ? await this.categoryRepository.findBy({
                      id: In(data.categories),
                  })
                : [],
            creator: createUser,
            executor: executorUser,
            parent: !isNil(data.parent) ? await this.detail(data.parent) : null,
        };

        const task = await this.repository.save(taskTemp);

        // creat first comment
        await this.commentService.create({
            body: ` @${createUser.username} 创建了任务`,
            task: task.id,
        });

        // creat first historical record
        await this.historicalRecordsService.create({
            body: ` @${createUser.username} 创建了任务`,
            task: task.id,
            creator: createUser.id,
        });

        return this.detail(task.id);
    }

    async creatByUserIds(data: CreatByUserIdsDto) {
        const { ids, task } = data;
        const item = await this.detail(task);
        const taskTemp: any = omit(item, ['id']);
        taskTemp.creator = taskTemp.creator.id;
        ids.forEach((id) => {});
        for (let index = 0; index < ids.length; index++) {
            taskTemp.executor = ids[index];
            this.create(taskTemp);
        }
        return {
            status: true,
        };
    }

    /**
     * 更新任务
     * @param data
     */
    async update(data: UpdateTaskDto) {
        const task = await this.detail(data.id);
        if (isArray(data.categories)) {
            // 更新任务所属分类
            await this.repository
                .createQueryBuilder('task')
                .relation(TaskEntity, 'categories')
                .of(task)
                .addAndRemove(data.categories, task.categories ?? []);
        }

        await this.repository.update(
            data.id,
            omit(
                {
                    ...data,
                    executor: await this.userService.findById(data.executor),
                    parent: !isNil(data.parent) ? await this.detail(data.parent) : null,
                },
                ['id', 'categories', 'creator'],
            ),
        );
        return this.detail(data.id);
    }

    /**
     * 删除任务
     * @param ids
     * @param trash
     */
    async delete(ids: string[], trash?: boolean) {
        const items = await this.repository.find({
            where: { id: In(ids) } as any,
            withDeleted: true,
        });
        if (trash) {
            const directs = items.filter((item) => !isNil(item.deletedAt));
            const softs = items.filter((item) => isNil(item.deletedAt));
            return [
                ...(await this.repository.remove(directs)),
                ...(await this.repository.softRemove(softs)),
            ];
        }
        return this.repository.remove(items);
    }

    /**
     * 恢复任务
     * @param ids
     */
    async restore(ids: string[]) {
        const items = await this.repository.find({
            where: { id: In(ids) } as any,
            withDeleted: true,
        });
        const trasheds = items.filter((item) => !isNil(item)).map((item) => item.id);
        if (trasheds.length < 0) return [];
        await this.repository.restore(trasheds);
        const qb = await this.buildListQuery(this.repository.buildBaseQB(), {}, async (qbuilder) =>
            qbuilder.andWhereInIds(trasheds),
        );
        return qb.getMany();
    }

    /**
     * 构建任务列表查询器
     * @param qb 初始查询构造器
     * @param options 排查分页选项后的查询选项
     * @param callback 添加额外的查询
     */
    protected async buildListQuery(
        qb: SelectQueryBuilder<TaskEntity>,
        options: FindParams,
        callback?: QueryHook<TaskEntity>,
    ) {
        const { category, orderBy, isPublished, trashed = SelectTrashMode.NONE } = options;
        // 是否查询回收站
        if (trashed === SelectTrashMode.ALL || trashed === SelectTrashMode.ONLY) {
            qb.withDeleted();
            if (trashed === SelectTrashMode.ONLY) qb.where(`task.deletedAt is not null`);
        }
        if (typeof isPublished === 'boolean') {
            isPublished
                ? qb.where({
                      publishedAt: Not(IsNull()),
                  })
                : qb.where({
                      publishedAt: IsNull(),
                  });
        }

        this.queryOrderBy(qb, orderBy);
        if (category) {
            await this.queryByCategory(category, qb);
        }
        if (callback) return callback(qb);
        return qb;
    }

    /**
     *  对任务进行排序的Query构建
     * @param qb
     * @param orderBy 排序方式
     */
    protected queryOrderBy(qb: SelectQueryBuilder<TaskEntity>, orderBy?: TaskOrderType) {
        switch (orderBy) {
            case TaskOrderType.CREATED:
                return qb.orderBy('task.createdAt', 'DESC');
            case TaskOrderType.PUBLISHED:
                return qb.orderBy('task.publishedAt', 'DESC');
            case TaskOrderType.SERIALNUMBER:
                return qb.orderBy('task.serialNumber', 'DESC');
            case TaskOrderType.CREATOR:
                return qb.orderBy('task.creator', 'DESC');
            default:
                return qb
                    .orderBy('task.createdAt', 'ASC')
                    .orderBy('task.serialNumber', 'ASC')
                    .addOrderBy('task.publishedAt', 'ASC');
        }
    }

    /**
     * 查询出分类及其后代分类下的所有任务的Query构建
     * @param id
     * @param qb
     */
    protected async queryByCategory(id: string, qb: SelectQueryBuilder<TaskEntity>) {
        const root = await this.categoryService.detail(id);
        const tree = await this.categoryRepository.findDescendantsTree(root);
        const flatDes = await this.categoryRepository.toFlatTrees(tree.children);
        const ids = [tree.id, ...flatDes.map((item) => item.id)];
        return qb.where('categories.id IN (:...ids)', {
            ids,
        });
    }
}
