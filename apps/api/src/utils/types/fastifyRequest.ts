import 'fastify';

import {UserData} from "./user";

declare module 'fastify' {
  interface FastifyRequest {
    user?: UserData;
  }
}
