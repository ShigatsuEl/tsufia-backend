/* eslint-disable @typescript-eslint/no-unused-vars */
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { Room } from '@rooms/entities/room.entity';
import { User } from '@users/entities/user.entity';

const ORIGIN = process.env.NODE_ENV === 'production' ? 'https://tsufia.netlify.app' : 'http://localhost:3000';

@WebSocketGateway(undefined, { cors: { origin: ORIGIN, credentials: true } })
export class RoomsGateway {
  @WebSocketServer() server: Server;

  // Join Rooms
  @SubscribeMessage('rooms:join:server')
  handleJoinRoom(@ConnectedSocket() client: Socket) {
    client.join('rooms');
    console.log(this.server.sockets.adapter.rooms);
  }

  // Join Room
  @SubscribeMessage('rooms:join-room:server')
  handleJoinOneRoom(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    client.join(`rooms/${data}`);
    client['roomId'] = data;
    console.log(this.server.sockets.adapter.rooms);
  }

  // Create Room
  @SubscribeMessage('rooms:create:server')
  handleCreateRoom(@MessageBody() data: Room, @ConnectedSocket() client: Socket) {
    client.leave('rooms');
    client.data.host = true;
    console.log(this.server.sockets.adapter.rooms);
    this.server.to('rooms').emit('rooms:create:client', data);
  }

  // Get Room
  @SubscribeMessage('rooms:get:server')
  handleGetRoom(@MessageBody('room') room: Room, @MessageBody('user') user: User, @ConnectedSocket() client: Socket) {
    const currentUser = room.userList.find((listUser) => listUser.id === user.id);
    if (currentUser && currentUser.host) client.data.host = true;
  }

  // Update Rooms
  @SubscribeMessage('rooms:update:server')
  handleUpdateRoom(@MessageBody() data: Room, @ConnectedSocket() client: Socket) {
    this.server.to('rooms').emit('rooms:update:client', data);
    this.server.to(`rooms/${data.id}`).emit('rooms:update:each-client', data);
  }

  // Remove Room
  @SubscribeMessage('rooms:remove:server')
  handleRemoveRoom(@MessageBody() data: number, @ConnectedSocket() client: Socket) {
    this.server.to('rooms').emit('rooms:remove:client', data);
    client.leave(`rooms/${data}`);
    client['roomId'] = undefined;
    client.data.host = undefined;
    console.log(this.server.sockets.adapter.rooms);
  }

  // Enter Room
  @SubscribeMessage('rooms:enter:server')
  handleEnterRoom(@MessageBody('room') data: Room, @MessageBody('user') user: User, @ConnectedSocket() client: Socket) {
    client.leave('rooms');
    console.log(this.server.sockets.adapter.rooms);
    this.server.to('rooms').emit('rooms:enter:client', data);
    client.broadcast.to(`rooms/${data.id}`).emit('rooms:enter:broadcast-client', user);
    this.server.to(`rooms/${data.id}`).emit('rooms:enter:each-client', data);
    if (data.currentHeadCount === data.totalHeadCount && !data.game) {
      client.emit('games:create:only-self-client', data.id);
    }
  }

  // Leave Room
  @SubscribeMessage('rooms:leave:server')
  handleLeaveRoom(@MessageBody('room') data: Room, @MessageBody('user') user: User, @ConnectedSocket() client: Socket) {
    client.leave(`rooms/${data.id}`);
    client['roomId'] = undefined;
    client.data.host = undefined;
    console.log(this.server.sockets.adapter.rooms);
    this.server.to('rooms').emit('rooms:leave:client', data);
    client.broadcast.to(`rooms/${data.id}`).emit('rooms:leave:broadcast-client', user);
    this.server.to(`rooms/${data.id}`).emit('rooms:leave:each-client', data);
  }
}
