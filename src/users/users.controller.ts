import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { CreateUserInputDto, CreateUserOutputDto } from '@users/dtos/create-user.dto';
import { User } from '@users/entities/user.entity';
import { UsersService } from '@users/users.service';

export type RequestWithUserData = Request & { user: User };

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /* Create User Controller */
  @Post('sign-up')
  async createUser(@Body() createUserInputDto: CreateUserInputDto): Promise<CreateUserOutputDto> {
    return this.usersService.createUser(createUserInputDto);
  }

  /* Get User Controller  */
  @UseGuards(JwtAuthGuard)
  @Get(':id/profile')
  getUser(@Param('id') userId: string) {
    return this.usersService.getUser({ id: +userId });
  }
}
