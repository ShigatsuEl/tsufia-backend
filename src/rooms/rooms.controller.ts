import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { RequestWithUser, RequestWithUserOrId } from '@common/common.interface';
import { RoomsService } from '@rooms/rooms.service';
import { CreateRoomInputDto, CreateRoomOutputDto } from '@rooms/dtos/create-room.dto';
import { PatchRoomInputDto, PatchRoomOutputDto } from '@rooms/dtos/patch-room.dto';
import { DeleteRoomOutputDto } from '@rooms/dtos/delete-room.dto';
import { PatchSurviveInputDto, PatchSurviveOutputDto } from '@rooms/dtos/patch-survive.dto';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  /* Create Room Controller */
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createRoom(
    @Req() requestWithUser: RequestWithUser,
    @Body() createRoomInputDto: CreateRoomInputDto,
  ): Promise<CreateRoomOutputDto> {
    return this.roomsService.createRoom(requestWithUser, createRoomInputDto);
  }

  /* Get Rooms Controller */
  @UseGuards(JwtAuthGuard)
  @Get()
  async getRooms(@Req() requestWithUser: RequestWithUser) {
    return this.roomsService.getRooms(requestWithUser);
  }

  /* Get Room Controller */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getRoom(@Req() requestWithUser: RequestWithUser, @Param('id') roomId: string) {
    return this.roomsService.getRoom(requestWithUser, roomId);
  }

  /* Patch Room Controller */
  @UseGuards(JwtAuthGuard)
  @Patch('update')
  async patchRoom(
    @Req() requestWithUser: RequestWithUser,
    @Body() patchRoomInputDto: PatchRoomInputDto,
  ): Promise<PatchRoomOutputDto> {
    return this.roomsService.patchRoom(requestWithUser, patchRoomInputDto);
  }

  /* Delete Room Controller */
  @UseGuards(JwtAuthGuard)
  @Delete('delete')
  async deleteRoom(@Req() requestWithUserOrId: RequestWithUserOrId): Promise<DeleteRoomOutputDto> {
    return this.roomsService.deleteRoom(requestWithUserOrId);
  }
}

@Controller('api/rooms')
export class RoomsAPIController {
  constructor(private readonly roomsService: RoomsService) {}

  /* Enter Room API */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/enter')
  async enterRoom(@Req() requestWithUser: RequestWithUser, @Param('id') roomId: string): Promise<PatchRoomOutputDto> {
    return this.roomsService.enterRoom(requestWithUser, roomId);
  }

  /* Leave Room API */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/leave')
  async leaveRoom(
    @Req() requestWithUserOrId: RequestWithUserOrId,
    @Param('id') roomId: string,
    roomIdPinch: string,
  ): Promise<PatchRoomOutputDto> {
    if (roomId) return this.roomsService.leaveRoom(requestWithUserOrId, roomId);
    return this.roomsService.leaveRoom(requestWithUserOrId, roomIdPinch);
  }

  /* Create UserRole from Room Userlist API */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/create/user-role')
  async createUserRole(
    @Req() requestWithUser: RequestWithUser,
    @Param('id') roomId: string,
  ): Promise<PatchRoomOutputDto> {
    return this.roomsService.createUserRole(requestWithUser, roomId);
  }

  /* Patch Survive from Room Userlist API */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/patch/survive')
  async patchSurvive(
    @Req() requestWithUser: RequestWithUser,
    @Param('id') roomId: string,
    @Body() patchSurviveInputDto: PatchSurviveInputDto,
  ): Promise<PatchSurviveOutputDto> {
    return this.roomsService.patchSurvive(requestWithUser, roomId, patchSurviveInputDto);
  }

  /* Patch Restart Room API */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/patch/restart')
  async patchRestartRoomGame(
    @Req() requestWithUser: RequestWithUser,
    @Param('id') roomId: string,
  ): Promise<PatchRoomOutputDto> {
    return this.roomsService.patchRestartRoom(requestWithUser, roomId);
  }
}
