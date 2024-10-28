import { ZodValidationPipe} from '@backend-template/http';
import { Body, Controller, Post, UsePipes } from '@nestjs/common';

import {convertAndSendResponse} from "../utils/helper/response";
import { AuthService } from './auth.service';
import {
  EmailPayload,
  EmailSchema,
  LoginPayload,
  LoginSchema,
  ResetPasswordPayload,
  ResetPasswordSchema, SignupPayload, SignupSchema,
  VerifyOtpPayload,
  VerifyOtpSchema
} from "./dto/auth";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post('signup')
  @UsePipes(new ZodValidationPipe(SignupSchema))
  async signup(@Body() payload: SignupPayload) {
    const data = await this.authService.signup(payload);
    return convertAndSendResponse(data);
  }
  @Post('login')
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(@Body() payload: LoginPayload) {
    const data = await this.authService.login(payload);
    return convertAndSendResponse(data);
  }

  @Post('validate-otp')
  @UsePipes(new ZodValidationPipe(VerifyOtpSchema))
  async validateOtp(@Body() payload: VerifyOtpPayload) {
    const data = await this.authService.validateOtp(payload);
    return convertAndSendResponse(data);
  }

  @Post('resend-otp')
  @UsePipes(new ZodValidationPipe(EmailSchema))
  async resendOtp(@Body() payload: VerifyOtpPayload) {
    const data = await this.authService.resendOtp(payload);
    return convertAndSendResponse(data);
  }

  @Post('request-password-reset')
  @UsePipes(new ZodValidationPipe(EmailSchema))
  async requestPasswordReset(@Body() payload: EmailPayload) {
    const data = await this.authService.requestPasswordReset(payload);
    return convertAndSendResponse(data);
  }


  @Post('reset-password')
  @UsePipes(new ZodValidationPipe(ResetPasswordSchema))
  async resetPassword(@Body() payload: ResetPasswordPayload) {
    const data = await this.authService.resetPassword(payload);
    return convertAndSendResponse(data);
  }
}
