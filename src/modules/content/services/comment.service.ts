import { ForbiddenException, Injectable } from '@nestjs/common';

import { isNil } from 'lodash';

import { EntityNotFoundError, In, SelectQueryBuilder } from 'typeorm';

import { manualPaginate } from '@/modules/database/helpers';

import { CreateCommentDto, QueryCommentDto, QueryCommentTreeDto } from '../dtos';
import { CommentEntity } from '../entities/comment.entity';
import { TaskRepository } from '../repositories';
import { CommentRepository } from '../repositories/comment.repository';

import { UserService } from './user.service';

/**
 * 评论数据操作
 */
@Injectable()
export class CommentService {
    constructor(
        protected repository: CommentRepository,
        protected taskRepository: TaskRepository,
        protected userService: UserService,
    ) {}

    /**
     * 直接查询评论树
     * @param options
     */
    async findTrees(options: QueryCommentTreeDto = {}) {
        return this.repository.findTrees({
            addQuery: (qb) => {
                return isNil(options.task) ? qb : qb.where('task.id = :id', { id: options.task });
            },
        });
    }

    /**
     * 查找一篇文章的评论并分页
     * @param dto
     */
    async paginate(dto: QueryCommentDto) {
        const { task, ...query } = dto;
        const addQuery = (qb: SelectQueryBuilder<CommentEntity>) => {
            const condition: Record<string, string> = {};
            if (!isNil(task)) condition.task = task;
            return Object.keys(condition).length > 0 ? qb.andWhere(condition) : qb;
        };
        const data = await this.repository.findRoots({
            addQuery,
        });
        let comments: CommentEntity[] = [];
        for (let i = 0; i < data.length; i++) {
            const c = data[i];
            comments.push(
                await this.repository.findDescendantsTree(c, {
                    addQuery,
                }),
            );
        }
        comments = await this.repository.toFlatTrees(comments);
        return manualPaginate(query, comments);
    }

    /**
     * 新增评论
     * @param data
     * @param user
     */
    async create(data: CreateCommentDto) {
        const parent = await this.getParent(undefined, data.parent);
        if (!isNil(parent) && parent.task.id !== data.task) {
            throw new ForbiddenException('Parent comment and child comment must belong same task!');
        }
        const item = await this.repository.save({
            ...data,
            parent,
            creator: !isNil(data.creator) ? await this.userService.findById(data.creator) : null,
            task: await this.getTask(data.task),
        });
        return this.repository.findOneOrFail({ where: { id: item.id } });
    }

    /**
     * 删除评论
     * @param ids
     */
    async delete(ids: string[]) {
        const comments = await this.repository.find({ where: { id: In(ids) } });
        return this.repository.remove(comments);
    }

    /**
     * 获取评论所属文章实例
     * @param id
     */
    protected async getTask(id: string) {
        return !isNil(id) ? this.taskRepository.findOneOrFail({ where: { id } }) : id;
    }

    /**
     * 获取请求传入的父分类
     * @param current 当前分类的ID
     * @param id
     */
    protected async getParent(current?: string, id?: string) {
        if (current === id) return undefined;
        let parent: CommentEntity | undefined;
        if (id !== undefined) {
            if (id === null) return null;
            parent = await this.repository.findOne({
                relations: ['parent', 'task'],
                where: { id },
            });
            if (!parent) {
                throw new EntityNotFoundError(CommentEntity, `Parent comment ${id} not exists!`);
            }
        }
        return parent;
    }
}
