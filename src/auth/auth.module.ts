import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController, GoogleController } from '@auth/auth.controller';
import { AuthService } from '@auth/auth.service';
import { LocalStrategy } from '@auth/strategies/local.strategy';
import { UsersModule } from '@users/users.module';
import { JwtStrategy } from '@auth/strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleStrategy } from '@auth/strategies/google.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_TOKEN_SECRET_KEY'),
        signOptions: {
          expiresIn: +configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
        },
      }),
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, GoogleStrategy],
  controllers: [AuthController, GoogleController],
})
export class AuthModule {}
