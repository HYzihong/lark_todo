import { isNil } from 'lodash';
import { DataSource, EventSubscriber, InsertEvent } from 'typeorm';

import { TaskEntity } from '../entities';
import { TaskRepository } from '../repositories';

/**
 * Task观察者
 */

@EventSubscriber()
export class TaskSubscriber {
    constructor(protected dataSource: DataSource, protected repository: TaskRepository) {
        this.dataSource.subscribers.push(this);
    }

    listenTo() {
        return TaskEntity;
    }

    async beforeInsert(event: InsertEvent<TaskEntity>) {
        // console.log(`BEFORE TaskEntity INSERTED: `, event.entity);
        if (isNil(event.entity.serialNumber)) {
            event.entity.serialNumber = `t1000${await this.repository.count()}`;
            // console.log(event.entity.serialNumber);
        }
        if (isNil(event.entity.parent) && !event.entity.isRoot) {
            event.entity.isRoot = true;
        }
    }
}
