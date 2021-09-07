/* eslint-disable @typescript-eslint/no-unused-vars */
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { Game } from '@games/entities/game.entity';
import { Room } from '@rooms/entities/room.entity';

@WebSocketGateway(undefined, { cors: { origin: 'http://localhost:3000', credentials: true } })
export class GamesGateway {
  @WebSocketServer() server: Server;

  /* Create Game Event */
  @SubscribeMessage('games:create:server')
  handleCreateGame(
    @MessageBody('game') game: Game,
    @MessageBody('roomId') roomId: number,
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(`rooms/${roomId}`).emit('games:create:each-client', game);
  }

  /* Create Game Event */
  @SubscribeMessage('games:patch:game/1:server')
  handlePatchGame(
    @MessageBody('gameId') gameId: number,
    @MessageBody('roomId') roomId: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.emit('games:patch:game:self-client', gameId, roomId);
  }

  @SubscribeMessage('games:patch:game/2:server')
  handlePatchRoomGame(
    @MessageBody('game') game: Game,
    @MessageBody('roomId') roomId: number,
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(`rooms/${roomId}`).emit('games:patch:game:each-client', game);
  }

  @SubscribeMessage('games:patch:user-role/1:server')
  handleUserRolebyHost(@MessageBody() roomId: number, @ConnectedSocket() client: Socket) {
    client.emit('games:patch:user-role:self-client', roomId);
  }

  @SubscribeMessage('games:patch:user-role/2:server')
  handlePatchUserRole(@MessageBody() room: Room, @ConnectedSocket() client: Socket) {
    this.server.to(`rooms/${room.id}`).emit('games:patch:user-role:each-client', room);
  }
}
