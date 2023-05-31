import { Exclude, Expose, Type } from 'class-transformer';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    Tree,
    TreeChildren,
    TreeParent,
} from 'typeorm';

import { TaskEntity } from './task.entity';
import { UserEntity } from './user.entity';

/**
 * 树形嵌套评论
 */
@Exclude()
@Tree('materialized-path')
@Entity('content_comments')
export class CommentEntity extends BaseEntity {
    @Expose()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Expose()
    @Column({ comment: '评论内容', type: 'longtext' })
    body: string;

    @Column({
        comment: '评论类型:文字/图片/附件/复杂类型', // 前端使用 @file xxx 和 @image xxx 来处理复杂评论展示
        nullable: true,
    })
    type?: string;

    @Expose()
    depth = 0;

    /**
     * 创建人
     */
    @Expose()
    @ManyToOne((type) => UserEntity, (user) => user.comments, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    creator: UserEntity;

    /**
     * 创建时间
     */
    @Expose()
    @Type(() => Date)
    @CreateDateColumn({
        comment: '创建时间',
    })
    createdAt: Date;

    @Expose()
    @ManyToOne((type) => TaskEntity, (task) => task.comments, {
        // 任务不能为空
        nullable: false,
        // 跟随父表删除与更新
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    task: TaskEntity;

    @TreeParent({ onDelete: 'CASCADE' })
    parent: CommentEntity | null;

    @Expose()
    @TreeChildren({ cascade: true })
    children: CommentEntity[];
}
