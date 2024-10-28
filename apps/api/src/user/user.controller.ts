import { ZodValidationPipe} from '@backend-template/http';
import {Body, Controller, Get, Post, Req, UseGuards, UsePipes} from '@nestjs/common';
import {FastifyRequest} from "fastify";

import {AuthGuard} from "../utils/guards/auth";
import {convertAndSendResponse} from "../utils/helper/response";
import {
  CompleteProfilePayload,
  CompleteProfileSchema,
} from "./dto/user";
import { UserService } from './user.service';

@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}


  @Get('profile')
  async getProfile(
    @Req() req: FastifyRequest) {
    const userId = req?.user?.id as string;
    const data = await this.userService.getProfile(userId);
    return convertAndSendResponse(data);
  }

  // @Post('bvn')
  // @UsePipes(new ZodValidationPipe(BvnVerficationSchema))
  // async bvnVerification(@Body() payload: BvnVerficationPayload) {
  //   const data = await this.userService.verifyBvn(payload);
  //   return convertAndSendResponse(data);
  // }

  @Post('complete-profile')
  @UsePipes(new ZodValidationPipe(CompleteProfileSchema))
  async completeProfile(
    @Req() req: FastifyRequest,
    @Body() payload: CompleteProfilePayload) {
    const userId = req?.user?.id as string;
    const data = await this.userService.completeProfile(userId, payload);
    return convertAndSendResponse(data);
  }
}
