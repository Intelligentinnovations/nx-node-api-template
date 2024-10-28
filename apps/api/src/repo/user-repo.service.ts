import {KyselyService} from "@backend-template/database";
import { Injectable } from '@nestjs/common';

import {SignupPayload} from "../auth/dto/auth";
import { SecretsService } from '../secrets/secrets.service';
import {CompleteProfilePayload} from "../user/dto/user";
import {DB} from "../utils/types";

@Injectable()
export class UserRepo {
  constructor(
    private secrets: SecretsService,
    private client: KyselyService<DB>
  ) {}

  async getUserByEmail(email: string) {
    return this.client
      .selectFrom('User')
      .select(['id', 'email', 'password', 'name', 'isVerified'])
      .where('email', '=', email)
      .executeTakeFirst()
  }

  async updateUser(param: {payload: {isVerified?: boolean, name?: string; password?: string}; email: string}) {
    return this.client.
      updateTable('User')
      .set(param.payload)
      .returning(['id', 'name', 'email', 'isVerified'])
      .where('email', '=', param.email)
      .executeTakeFirst()
  }

  async create(param: SignupPayload) {
    return this.client.insertInto('User')
      .values(param)
      .returning(['id', 'name', 'email', 'isVerified'])
      .executeTakeFirst()
  }

  async completeProfile(userId: string, payload: CompleteProfilePayload) {
    return this.client.updateTable('User')
      .set(payload)
      .where('id', '=', userId)
      .returning([
        'id',
        'email',
        'name',
        'bvn',
        'isVerified',
        'companyName',
        'workDescription',
        'workTitle',
        'typeOfWork'
      ])
      .executeTakeFirst()
  }

  async getProfile(userId: string) {
  return this.client.selectFrom('User')
      .select(['id',
        'email',
        'name',
        'bvn',
        'isVerified',
        'companyName',
        'workDescription',
        'workTitle',
        'typeOfWork',
        ])
      .where('id', '=', userId)
      .executeTakeFirst()
  }
}
