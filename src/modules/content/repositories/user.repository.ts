import { Repository } from 'typeorm';

import { CustomRepository } from '@/modules/database/decorators';

import { UserEntity } from '../entities';

@CustomRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {
    protected qbName = 'user';
}
