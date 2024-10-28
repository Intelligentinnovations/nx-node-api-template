import { KyselyService } from '@backend-template/database';
import { MESSAGE_MANAGER, Sns } from '@backend-template/messaging';
import { Global, Module } from '@nestjs/common';

import { SecretsModule } from '../secrets/secrets.module';
import { SecretsService } from '../secrets/secrets.service';

@Global()
@Module({
  imports: [SecretsModule],
  providers: [
    {
      provide: KyselyService,
      inject: [SecretsService],
      useFactory: (secrets: SecretsService) => {
        return new KyselyService(secrets.get('DATABASE_URL'));
      },
    },
    { provide: MESSAGE_MANAGER, useClass: Sns },
  ],
  exports: [KyselyService, MESSAGE_MANAGER],
})
export class LibrariesModule {}
