/*
 * @Author: hy
 * @Date: 2023-06-01 00:31:53
 * @LastEditors: hy
 * @Description:
 * @LastEditTime: 2023-06-01 03:47:50
 * @FilePath: /lark_todolist/src/modules/content/services/user.service.ts
 * Copyright 2023 hy, All Rights Reserved.
 */
import { Injectable } from '@nestjs/common';

import { isNil } from 'lodash';

import { UserEntity } from '../entities';
import { UserRepository } from '../repositories/user.repository';

/**
 * 分类数据操作
 */
@Injectable()
export class UserService {
    constructor(protected repository: UserRepository) {}

    async onModuleInit() {
        const TestUser = await this.searchByName('test_user');
        if (!isNil(TestUser)) {
            return TestUser;
        }
        return this.create({ username: 'test_user' } as any);
    }

    /**
     * 新增用户
     */
    async create(date: any): Promise<UserEntity> {
        return this.repository.save(date);
    }

    /**
     * 获取同一组里的用户列表
     */
    // TODO user group
    async list(): Promise<UserEntity[]> {
        return this.repository.find({ select: ['id', 'username', 'avatar'] });
    }

    /**
     * 通过名字搜索个人信息
     * @param username 名字
     */
    async searchByName(username: string): Promise<UserEntity> {
        return this.repository.findOne({
            where: { username },
            select: ['id', 'username', 'avatar'],
        });
    }

    /**
     * 通过名字搜索个人信息
     * @param username 名字
     */
    async findById(id: string): Promise<UserEntity> {
        return this.repository.findOne({ where: { id }, select: ['id', 'username', 'avatar'] });
    }
}
