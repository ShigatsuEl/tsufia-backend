import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RequestWithUser } from '@rooms/rooms.interface';
import { CreateRoomInputDto, CreateRoomOutputDto } from '@rooms/dtos/create-room.dto';
import { Room, Status } from '@rooms/entities/room.entity';
import { User } from '@users/entities/user.entity';
import { GetRoomsOutputDto } from '@rooms/dtos/get-rooms.dts';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async createRoom(
    requestWithUser: RequestWithUser,
    createRoomInputDto: CreateRoomInputDto,
  ): Promise<CreateRoomOutputDto> {
    try {
      // 사용자 인증 상태 확인
      const {
        user: { id },
      } = requestWithUser;
      if (!id) return { ok: false, error: '접근 권한을 가지고 있지 않습니다' };
      const user = await this.userRepository.findOne({ id }, { select: ['id', 'firstName', 'lastName', 'nickname'] });
      if (!user) return { ok: false, error: '사용자를 찾을 수 없습니다' };

      // Dto 입력값 확인
      const { title, totalHeadCount } = createRoomInputDto;
      if (!title) return { ok: false, error: '방 제목 입력은 필수입니다' };
      if (!totalHeadCount) return { ok: false, error: '총 인원 수 입력은 필수입니다' };

      // Room 생성
      const room = this.roomRepository.create({ title, totalHeadCount });
      room.currentHeadCount = 1;
      room.status = Status.대기중;
      user.host = true;
      room.userList = [user];
      await this.roomRepository.save(room);
      return { ok: true, room };
    } catch (error) {
      console.log(error);
      return { ok: false, error: '방 생성을 실패하였습니다' };
    }
  }

  async getRooms(requestWithUser: RequestWithUser): Promise<GetRoomsOutputDto> {
    try {
      // 사용자 인증 상태 확인
      const {
        user: { id },
      } = requestWithUser;
      if (!id) return { ok: false, error: '접근 권한을 가지고 있지 않습니다' };

      const rooms = await this.roomRepository.find();
      return { ok: true, rooms };
    } catch (error) {
      return { ok: false, error: '방들의 정보를 불러올 수 없습니다' };
    }
  }
}
