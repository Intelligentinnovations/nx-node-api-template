import { DefaultInterceptor } from '@backend-template/rest-server';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { redisStore } from 'cache-manager-redis-yet';

import { AuthModule } from './auth/auth.module';
import {LibrariesModule} from "./libraries/libraries.module";
import {SecretsModule} from "./secrets/secrets.module";
import {SecretsService} from "./secrets/secrets.service";
import {RepoModule} from "./repo/repo.module";
import {UserModule} from "./user/user.module";

@Module({
  imports: [
    SecretsModule,
    RepoModule,
    LibrariesModule,
    CacheModule.registerAsync({
      useFactory: async (secrets: SecretsService) => {
        return {
          isGlobal: true,
          store: await redisStore({
            url: secrets.get('REDIS_URL'),
            ttl: 600000,
          }),
        };
      },
      inject: [SecretsService],
      isGlobal: true,
    }),
    AuthModule,
    UserModule
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: DefaultInterceptor,
    },
  ],
})
export class AppModule {}
