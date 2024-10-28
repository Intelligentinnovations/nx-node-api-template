import { Global, Module } from '@nestjs/common';

import {UserRepo} from "./user-repo.service";

@Global()
@Module({
    providers: [

        UserRepo,
    ],
    exports: [
        UserRepo
    ],
})
export class RepoModule {}
