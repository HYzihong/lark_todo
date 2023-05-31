import { Exclude, Expose, Type } from 'class-transformer';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import { CommentEntity } from './comment.entity';
import { TaskEntity } from './task.entity';

/**
 * 用户模型
 */
@Exclude()
@Entity('user')
export class UserEntity extends BaseEntity {
    [key: string]: any;

    @Expose()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Expose()
    @Column({ comment: '用户名', unique: true })
    username!: string;

    @Expose()
    @Column({ comment: '头像地址', default: '' })
    avatar?: string;

    // @Column({ comment: '密码', length: 500, select: false })
    // password!: string;

    // TODO group

    @Column({
        name: 'is_deleted',
        default: () => false,
    })
    isDeleted!: boolean;

    /**
     * 任务
     */
    @Expose()
    @OneToMany((type) => TaskEntity, (task) => task.creator, {
        cascade: true,
    })
    tasks: TaskEntity[];

    /**
     * 所需要执行的任务
     */
    @Expose()
    @OneToMany((type) => TaskEntity, (task) => task.executor, {
        cascade: true,
    })
    executionTasks: TaskEntity[];

    @Expose()
    @OneToMany((type) => CommentEntity, (comment) => comment.creator, {
        cascade: true,
    })
    comments: CommentEntity[];

    @Expose()
    @Type(() => Date)
    @CreateDateColumn({
        comment: '创建时间',
    })
    createdAt: Date;

    @Expose()
    @Type(() => Date)
    @UpdateDateColumn({
        comment: '更新时间',
    })
    updatedAt: Date;

    @Expose()
    @Type(() => Date)
    @DeleteDateColumn({
        comment: '删除时间',
    })
    deletedAt: Date;
}
