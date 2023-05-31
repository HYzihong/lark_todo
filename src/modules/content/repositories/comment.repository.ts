import { pick, unset } from 'lodash';

import {
    FindOptionsUtils,
    FindTreeOptions,
    SelectQueryBuilder,
    TreeRepository,
    TreeRepositoryUtils,
} from 'typeorm';

import { CustomRepository } from '@/modules/database/decorators';

import { CommentEntity } from '../entities';

type FindCommentTreeOptions = FindTreeOptions & {
    addQuery?: (query: SelectQueryBuilder<CommentEntity>) => SelectQueryBuilder<CommentEntity>;
};
@CustomRepository(CommentEntity)
export class CommentRepository extends TreeRepository<CommentEntity> {
    /**
     * 构建基础查询器
     */
    buildBaseQB(qb: SelectQueryBuilder<CommentEntity>): SelectQueryBuilder<CommentEntity> {
        return qb
            .leftJoinAndSelect(`comment.parent`, 'parent')
            .leftJoinAndSelect(`comment.creator`, 'creator')
            .leftJoinAndSelect(`comment.task`, 'task')
            .orderBy('comment.createdAt', 'ASC');
    }

    /**
     * 查询树
     * @param options
     */
    async findTrees(options: FindCommentTreeOptions = {}) {
        options.relations = ['parent', 'children'];
        const roots = await this.findRoots(options);
        await Promise.all(roots.map((root) => this.findDescendantsTree(root, options)));
        return roots;
    }

    /**
     * 查询顶级评论
     * @param options
     */
    findRoots(options: FindCommentTreeOptions = {}) {
        const { addQuery, ...rest } = options;
        const escapeAlias = (alias: string) => this.manager.connection.driver.escape(alias);
        const escapeColumn = (column: string) => this.manager.connection.driver.escape(column);

        const joinColumn = this.metadata.treeParentRelation!.joinColumns[0];
        const parentPropertyName = joinColumn.givenDatabaseName || joinColumn.databaseName;

        let qb = this.buildBaseQB(this.createQueryBuilder('comment'));
        FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, rest);
        qb.where(`${escapeAlias('comment')}.${escapeColumn(parentPropertyName)} IS NULL`);
        qb = addQuery ? addQuery(qb) : qb;
        return qb.getMany();
    }

    /**
     * 查询后代元素
     * @param entity
     * @param options
     */
    findDescendants(entity: CommentEntity, options?: FindCommentTreeOptions) {
        const { addQuery } = options;
        let qb = this.buildBaseQB(
            this.createDescendantsQueryBuilder('comment', 'treeClosure', entity),
        );
        FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, options);
        qb.orderBy(`category.customOrder`, 'ASC');
        qb = addQuery ? addQuery(qb) : qb;
        return qb.getMany();
    }

    /**
     * 查询后代树
     * @param entity
     * @param options
     */
    async findDescendantsTree(
        entity: CommentEntity,
        options: FindCommentTreeOptions = {},
    ): Promise<CommentEntity> {
        const { addQuery } = options;
        let qb: SelectQueryBuilder<CommentEntity> = this.buildBaseQB(
            this.createDescendantsQueryBuilder('comment', 'treeClosure', entity),
        );
        qb = addQuery ? addQuery(qb) : qb;
        FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, pick(options, ['relations', 'depth']));
        const entities = await qb.getRawAndEntities();
        const relationMaps = TreeRepositoryUtils.createRelationMaps(
            this.manager,
            this.metadata,
            'comment',
            entities.raw,
        );
        TreeRepositoryUtils.buildChildrenEntityTree(
            this.metadata,
            entity,
            entities.entities,
            relationMaps,
            {
                depth: -1,
                ...pick(options, ['relations']),
            },
        );

        return entity;
    }

    /**
     * 打平并展开树
     * @param trees
     * @param depth
     */
    async toFlatTrees(trees: CommentEntity[], depth = 0) {
        const data: Omit<CommentEntity, 'children'>[] = [];
        for (const item of trees) {
            item.depth = depth;
            const { children } = item;
            unset(item, 'children');
            data.push(item);
            data.push(...(await this.toFlatTrees(children, depth + 1)));
        }
        return data as CommentEntity[];
    }
}
