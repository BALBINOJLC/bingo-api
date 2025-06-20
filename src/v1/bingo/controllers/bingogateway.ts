import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { BingoService } from '../services/bingo.service';

@WebSocketGateway({
    cors: {
        origin: ["http://localhost:3000", "http://127.0.0.1:3000", "https://bgapi.balbijlc.com"],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }
})
export class BingoGateway {
    @WebSocketServer()
    server: Server;
    constructor(private readonly bingoService: BingoService) {}
    @SubscribeMessage('joinGame')
    async handleJoinGame(client, eventId: string) {
        client.join(`game-${eventId}`);
        setInterval(async () => {
            try {
                const gameData = await this.bingoService.getNumberCalledGameSocket(eventId);
                this.server.to(`game-${eventId}`).emit('numberCalled', gameData);
            } catch (error) {
                console.error('Error getting game data:', error);
            }
        }, 5000);
    }

    async sendGameUpdate(gameId: string, data) {
        this.server.to(`game-${gameId}`).emit('numberCalled', data);
    }
}