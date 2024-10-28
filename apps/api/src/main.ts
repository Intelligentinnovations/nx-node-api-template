import { httpBootstrap } from '@backend-template/http';
import {
  awsBootstrap,
  awsService,
  AwsTransporter,
} from '@backend-template/microservice';
import awsLambdaFastify, { CallbackHandler } from '@fastify/aws-lambda';
import { APIGatewayProxyEvent, Handler, SNSEvent, SQSEvent } from 'aws-lambda';
import { firstValueFrom, ReplaySubject } from 'rxjs';

import {AppModule} from "./app.module";


const serverSubject = new ReplaySubject<CallbackHandler>();
httpBootstrap(AppModule, 'api').then((transporter) => {
  serverSubject.next(
    awsLambdaFastify(transporter.getHttpAdapter().getInstance(), {
      callbackWaitsForEmptyEventLoop: false,
    })
  );
});

const microserviceSubject = new ReplaySubject<AwsTransporter>();
awsBootstrap(AppModule).then((transporter) =>
  microserviceSubject.next(transporter)
);

export const handler: Handler = async (
  event: APIGatewayProxyEvent | SQSEvent | SNSEvent,
  context,
  callback
) => {
  console.log('event :: ', JSON.stringify(event));

  if ('requestContext' in event) {
    const server = await firstValueFrom(serverSubject);
    return server(event, context, callback);
  } else {
    const transporter = await firstValueFrom(microserviceSubject);
    await awsService(event, context, transporter);
  }
};
