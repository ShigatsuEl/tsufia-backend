import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';

import { RefreshTokenPayload } from '@auth/auth.interface';
import { LoginAuthInputDto, LoginAuthOutputDto } from '@auth/dtos/login-auth.dto';
import { SilentRefreshAuthOutputDto } from '@auth/dtos/silent-refresh-auth.dto';
import { ValidateAuthInputDto, ValidateAuthOutputDto } from '@auth/dtos/validate-auth.dto';
import { UsersService } from '@users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /* Validate User Service */
  async validateUser(validateAuthInputDto: ValidateAuthInputDto): Promise<ValidateAuthOutputDto> {
    try {
      const { email, password } = validateAuthInputDto;
      const { user } = await this.usersService.getUser({ email });
      if (!user) return { ok: false, error: '존재하지 않는 이메일 계정입니다.' };
      if (user && (await user.validatePassword(password)) === false) {
        return { ok: false, error: '패스워드가 일치하지 않습니다.' };
      }
      return { ok: true, data: user };
    } catch (error) {
      return { ok: false, error: '로그인 인증에 실패하였습니다.' };
    }
  }

  /* Login Service */
  async login(res: Response, loginAuthInputDto: LoginAuthInputDto): Promise<LoginAuthOutputDto> {
    try {
      const { ok, error, data } = loginAuthInputDto;

      // 로그인인 상태 확인
      if (ok === false) return { ok: false, error };
      if (data == null) return { ok: false, error: '토큰을 발급 받을 수 없습니다.' };

      // refreshToken & accessToken 발급
      const { id } = data;
      const payload = { id };
      const accessToken = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET_KEY'),
        expiresIn: +this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
      });
      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET_KEY'),
        expiresIn: +this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
      });

      // 쿠키 설정
      res.cookie('refreshToken', refreshToken, {
        expires: new Date(Date.now() + +this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')),
        httpOnly: true,
      });
      return {
        ok: true,
        accessToken,
      };
    } catch (error) {
      return { ok: false, error: '로그인 인증에 실패하였습니다.' };
    }
  }

  /* Silent Refresh Service */
  async silentRefresh(req: Request, res: Response): Promise<SilentRefreshAuthOutputDto> {
    try {
      // refreshToken 유효성 검사
      const getRefreshToken = req.cookies['refreshToken'];
      if (!getRefreshToken) return { ok: false, error: '쿠키를 가지고 있지 않습니다.' };
      const refreshTokenPayload: RefreshTokenPayload = await this.jwtService.verify(getRefreshToken, {
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET_KEY'),
      });

      // refreshToken & accessToken 재발급
      const payload = { id: refreshTokenPayload.id };
      const accessToken = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET_KEY'),
        expiresIn: +this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
      });
      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET_KEY'),
        expiresIn: +this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
      });

      // 쿠키 설정
      res.cookie('refreshToken', refreshToken, {
        expires: new Date(Date.now() + +this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')),
        httpOnly: true,
      });
      return {
        ok: true,
        accessToken,
      };
    } catch (error) {
      return { ok: false, error: '로그인 연장에 실패하였습니다.' };
    }
  }
}
