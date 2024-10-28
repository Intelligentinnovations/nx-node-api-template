import { httpBootstrap } from '@backend-template/http';
import { Logger } from '@nestjs/common';

import {AppModule} from "./app.module";

httpBootstrap(AppModule, 'api').then((res) => {
  const port = process.env.PORT ?? 3000;

  res
    .listen(port)
    .then(() =>
      Logger.log(`🚀 Application is running on: http://localhost:${port}/api`)
    );
});
