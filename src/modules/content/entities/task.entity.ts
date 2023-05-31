import { Exclude, Expose, Type } from 'class-transformer';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import { ReminderOrderType } from '../constants';

import { CategoryEntity } from './category.entity';
import { CommentEntity } from './comment.entity';
import { UserEntity } from './user.entity';

/**
 * 任务功能 梳理
 *
 * 模型
 *
 * 任务id 例 t100022
 * 标题
 * 描述
 * 创建人
 * 创建时间 （前端格式化
 * 执行人
 * 执行时间
 * 提醒时机 enum
 * 是否重复
 * 子任务 （是否是主任务）
 * 评论
 *
 * 筛选
 * 时间段
 * 创建人
 *
 * 排序
 * 创建时间
 * 计划完成时间
 * 创建者
 * ID
 *
 * 实现功能
 *
 * 增删改查
 * 修改历史记录
 * 内容筛选
 * 支持排序
 * 支持评论
 * @ 他人 （ 搜索 group 里面全部的user，前端使用 tributejs 来实现@ 他人的前端功能）
 * 消息提醒 定时任务？
 *
 */

/**
 * 任务模型
 */

@Exclude()
@Entity('content_tasks')
export class TaskEntity extends BaseEntity {
    @Expose()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * 任务序号
     */
    @Expose()
    @Column({
        name: 'serial_number',
        comment: '序号',
    })
    serialNumber: string;

    /**
     * 任务描述
     */
    @Expose()
    @Column({ comment: '任务标题' })
    title: string;

    /**
     * 任务描述
     */
    @Expose({ groups: ['task-detail'] })
    @Column({ comment: '任务内容', type: 'longtext' })
    body: string;

    /**
     * 任务执行人
     */
    @ManyToOne((type) => UserEntity, (user) => user.executionTasks, {
        // 跟随父表删除与更新
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    executor: UserEntity;

    @Expose()
    @Column({
        name: 'execution_time',
        comment: '执行时间',
        type: 'varchar',
        nullable: true,
    })
    executionAt: Date | null;

    @Expose()
    @Column({
        comment: '提醒时间',
        type: 'enum',
        enum: ReminderOrderType,
        default: null,
    })
    eminderTime?: ReminderOrderType;

    /**
     * 任务创建人
     */
    @ManyToOne((type) => UserEntity, (user) => user.tasks, {
        // 跟随父表删除与更新
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    creator: UserEntity;

    /**
     * 任务是否已删除
     */
    @Column({
        comment: '任务是否已删除',
        name: 'is_deleted',
        default: () => false,
    })
    isDeleted!: boolean;

    /**
     * 任务是否已完成
     */
    @Column({
        comment: '任务是否已完成',
        name: 'is_published',
        default: () => false,
    })
    isPublished!: boolean;

    /**
     * 是否是顶级任务
     */
    @Expose()
    @Column({
        comment: '是否是顶级任务',
        name: 'is_root',
        default: () => false,
    })
    isRoot!: boolean;

    /**
     * 父任务
     */
    @Expose()
    parent: TaskEntity | null;

    /**
     * 分类
     */
    @Expose()
    @Type(() => CategoryEntity)
    @ManyToMany(() => CategoryEntity, (category) => category.task, {
        cascade: true,
    })
    @JoinTable()
    categories: CategoryEntity[];

    // 评论
    // TODO 支持@他人
    @OneToMany((type) => CommentEntity, (comment) => comment.task, {
        cascade: true,
    })
    comments: CommentEntity[];

    @Expose()
    commentCount: number;

    @Expose()
    @Column({
        comment: '完成时间',
        type: 'varchar',
        nullable: true,
    })
    publishedAt?: Date | null;

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
