import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

import { UserRepo } from '../repo';
import { SecretsService } from '../secrets/secrets.service';
import {IServiceHelper} from "../utils/types";
import {
  CompleteProfilePayload,
} from "./dto/user";

@Injectable()
export class UserService {
  constructor(
    private userRepo: UserRepo,
    private secrets: SecretsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async completeProfile(userId: string, payload: CompleteProfilePayload): Promise<IServiceHelper> {
    const updatedProfile = await this.userRepo.completeProfile(userId, payload)
    return  {
      status: 'successful',
      message: 'Profile completed successfully.',
      data: updatedProfile
    }
  }

  async getProfile(userId: string): Promise<IServiceHelper> {
    const profile = await this.userRepo.getProfile(userId)
    return {
      status: 'successful',
      message: "Profile fetched successfully.",
      data: profile
    }
  }
}
