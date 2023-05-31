import { Exclude, Expose, Type } from 'class-transformer';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { TaskEntity } from './task.entity';
import { UserEntity } from './user.entity';

/**
 * 历史记录
 */
@Exclude()
@Entity('content_historical_records')
export class HistoricalRecordsEntity extends BaseEntity {
    @Expose()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Expose()
    @Column({ comment: '内容', type: 'longtext' })
    body: string;

    /**
     * 创建人
     */
    @Expose()
    @ManyToOne((type) => UserEntity, (user) => user.records, {
        nullable: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    creator: UserEntity;

    @Expose()
    @ManyToOne((type) => TaskEntity, (task) => task.records, {
        // 不能为空
        nullable: false,
        // 跟随父表删除与更新
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    task: TaskEntity;

    /**
     * 创建时间
     */
    @Expose()
    @Type(() => Date)
    @CreateDateColumn({
        comment: '创建时间',
    })
    createdAt: Date;
}
