import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { Cache } from 'cache-manager';
import jwt from 'jsonwebtoken';

import { UserRepo } from '../repo';
import { SecretsService } from '../secrets/secrets.service';
import {generateRandomNumber} from "../utils/helper/general";
import {IServiceHelper, User} from "../utils/types";
import {
  EmailPayload,
  LoginPayload,
  ResetPasswordPayload,
  SignupPayload,
  VerifyOtpPayload
} from "./dto/auth";

@Injectable()
export class AuthService {
  constructor(
    private userRepo: UserRepo,
    private secrets: SecretsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

    async signup(userPayload: SignupPayload): Promise<IServiceHelper> {
      const { email, password } = userPayload;
      const existingUserByEmail = await this.userRepo.getUserByEmail(email);
      if (existingUserByEmail)
      return {
        status: 'conflict',
        message: 'Email already in use',
      };

      const hashedPassword = await bcrypt.hash(password, 10);
      const userData = await this.userRepo.create({
          ...userPayload,
          password: hashedPassword
        });
      const token = jwt.sign(userPayload, this.secrets.get('SECRET_KEY'), {
        expiresIn: 30000
      });

      const OTP_LENGTH = 6;
      const otp = generateRandomNumber(OTP_LENGTH);
      const cacheKey = `${userPayload.email}-signup-verification`;

      await this.cacheManager.set(`${userPayload.email}-pending-otp`, cacheKey);
      await this.cacheManager.set(cacheKey, otp);

      // Todo Send otp via email
      return {
        status: 'created',
        message: 'An Otp has been sent to your email, please verify to ',
        data: { ...userData, token },
      };
    }

  async login(payload: LoginPayload): Promise<IServiceHelper> {
    const user = await this.userRepo.getUserByEmail(payload.email);
    if (!user)
      return {
        status: 'bad-request',
        message: `Invalid email or password`,
      };
    if (!user.isVerified) {
      const OTP_LENGTH = 6;
      const otp = generateRandomNumber(OTP_LENGTH);
      const cacheKey = `${payload.email}-signup-verification`;

      await this.cacheManager.set(`${user.email}-pending-otp`, cacheKey);
      await this.cacheManager.set(cacheKey, otp);
      return {
        status: 'successful',
        message:
          'An Otp has been sent to your email, please verify your account to continue',
      };
    }
    const passwordMatch = await bcrypt.compare(payload.password, user.password);
    const cacheKey = `${payload.email}-login-retry`;
    const loginRetry = Number(await this.cacheManager.get(cacheKey)) || 1;
    const MAX_RETRY = 5;
    if (!passwordMatch) {
      if (loginRetry >= MAX_RETRY)
        return {
          status: 'forbidden',
          message: 'Your have been locked out, please contact support',
        };
      await this.cacheManager.set(cacheKey, loginRetry + 1);
      return {
        status: 'bad-request',
        message: `Invalid email or password, you have ${
          MAX_RETRY - loginRetry
        } attempt left`,
      };
    }
    if (loginRetry > 1) await this.cacheManager.del(cacheKey);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userData } = user;
    const token = jwt.sign(userData, this.secrets.get('SECRET_KEY'), {
      expiresIn: 30000,
    });
    return {
      status: 'successful',
      message: 'Login successful',
      data: { ...userData, permissions: undefined, token },
    };
  }

  async requestPasswordReset({ email }: EmailPayload): Promise<IServiceHelper> {
    const user = await this.userRepo.getUserByEmail(email);
    if (user) {
      const OTP_LENGTH = 6;
      const otp = generateRandomNumber(OTP_LENGTH);
      const cacheKey = `${user.email}-password-reset`;

      await this.cacheManager.set(`${user.email}-pending-otp`, cacheKey);
      await this.cacheManager.set(cacheKey, otp);
      // Todo send email
    }
    return {
      status: 'successful',
      message: 'If you have an account, An Otp has been sent to your email.',
    };
  }

  async validateOtp(payload: VerifyOtpPayload): Promise<IServiceHelper> {
    const pendingOtpKey = `${payload.email}-pending-otp`;

    if (!pendingOtpKey)
      return {
        status: 'bad-request',
        message: 'Invalid Otp',
      };
    const originalOtpKey = (await this.cacheManager.get<string>(
      pendingOtpKey
    )) as string;
    const originalOtp = await this.cacheManager.get<string>(originalOtpKey);

    if (!originalOtp || originalOtp !== payload.otp)
      return {
        status: 'bad-request',
        message: 'Invalid Otp',
      };

    await this.cacheManager.del(pendingOtpKey);
    await this.cacheManager.del(originalOtpKey);

    if (originalOtpKey === `${payload.email}-signup-verification`) {
      const updatedUser = await this.userRepo.updateUser({
        email: payload.email,
        payload: { isVerified: true },
      })

      const token = jwt.sign(updatedUser as unknown as User, this.secrets.get('SECRET_KEY'), {
        expiresIn: 30000,
      });

      return {
        status: 'successful',
        message: 'Account verification successful',
        data: {
          ...updatedUser,
          password: undefined,
          token,
        },
      };
    }
    const verifiedActionKey = `${payload.email}-verified-action-otp`;
    await this.cacheManager.set(verifiedActionKey, originalOtpKey);
    return {
      status: 'successful',
      message: 'Otp verified successfully',
    };
  }

  async resetPassword(payload: ResetPasswordPayload): Promise<IServiceHelper> {
    const { email, password } = payload;
    const verifiedActionKey = `${email}-verified-action-otp`;
    const verifiedAction = await this.cacheManager.get(verifiedActionKey);

    if (!verifiedAction || verifiedAction !== `${email}-password-reset`)
      return {
        status: 'forbidden',
        message: 'Please verify otp to continue',
      };
    await this.userRepo.updateUser({
      email,
      payload: { password: await bcrypt.hash(password, 10) },
    });

    return {
      status: 'successful',
      message: 'Password reset successful',
    };
  }

  async resendOtp({ email }: EmailPayload): Promise<IServiceHelper> {
    const pendingOtpKey = `${email}-pending-otp`;
    const originalOtpKey = (await this.cacheManager.get<string>(
      pendingOtpKey
    )) as string;

    if (!originalOtpKey)
      return {
        status: 'bad-request',
        message: 'No pending otp',
      };

    const OTP_LENGTH = 6;
    const otp = generateRandomNumber(OTP_LENGTH);
    await this.cacheManager.set(originalOtpKey, otp);

    return {
      status: 'successful',
      message: 'Otp sent successfully',
    };
  }

}
