/*
 * @Author: hy
 * @Date: 2023-06-01 03:27:08
 * @LastEditors: hy
 * @Description:
 * @LastEditTime: 2023-06-01 04:50:37
 * @FilePath: /lark_todolist/src/modules/content/controllers/user.controller.ts
 * Copyright 2023 hy, All Rights Reserved.
 */
import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';

import { UserService } from '../services';

@ApiTags('用户管理')
@Controller('users')
export class UserController {
    constructor(protected service: UserService) {}

    @Get()
    async list() {
        return this.service.list();
    }

    @Get(':id')
    async detail(
        @Param('id', new ParseUUIDPipe())
        id: string,
    ) {
        return this.service.findById(id);
    }

    @Get('/username/:username')
    async searchByName(
        @Param('username')
        username: string,
    ) {
        return this.service.searchByName(username);
    }
}
