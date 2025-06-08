import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Patch, Req } from '@nestjs/common';
import { BingoService } from '../services/bingo.service';
import { CreateBingoEventDto, BingoEventQueryDto, PurchaseTicketDto, UpdateBingoEventStatusDto } from '../dtos/bingo.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common';
import { IRequestWithUser } from '@common';

@ApiTags('BINGO')
@Controller({
    version: '1',
    path: 'bingo',
})
@UseGuards(JwtAuthGuard)
export class BingoController {
    constructor(private readonly bingoService: BingoService) {}

    @Get('all')
    @ApiOperation({ summary: 'Obtener todos los eventos de bingo sin filtros' })
    @ApiResponse({ status: 200, description: 'Lista completa de eventos obtenida exitosamente' })
    async getAllEvents() {
        return this.bingoService.getAllEvents();
    }
    @Post('tickets/purchase/online')
    @ApiOperation({ summary: 'Comprar un ticket de bingo' })
    @ApiResponse({ status: 201, description: 'Ticket comprado exitosamente' })
    async purchaseTicket(@Body() purchaseTicketDto: PurchaseTicketDto) {
        return this.bingoService.purchaseTicket(purchaseTicketDto);
    }

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo evento de bingo' })
    @ApiResponse({ status: 201, description: 'Evento creado exitosamente' })
    async createEvent(@Body() createBingoEventDto: CreateBingoEventDto) {
        return this.bingoService.createEvent(createBingoEventDto);
    }

    @Get(':status')
    @ApiOperation({ summary: 'Obtener todos los eventos de bingo' })
    @ApiResponse({ status: 200, description: 'Lista de eventos obtenida exitosamente' })
    async getEventsAvailables(@Param('status') status: string) {
        return this.bingoService.getEventsByStatus(status);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los eventos de bingo' })
    @ApiResponse({ status: 200, description: 'Lista de eventos obtenida exitosamente' })
    async getEvents(@Query() query: BingoEventQueryDto) {
        return this.bingoService.getEvents(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un evento de bingo por ID' })
    @ApiResponse({ status: 200, description: 'Evento obtenido exitosamente' })
    async getEvent(@Param('id') id: string) {
        return this.bingoService.getEvent(id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un evento de bingo' })
    @ApiResponse({ status: 200, description: 'Evento eliminado exitosamente' })
    async deleteEvent(@Param('id') id: string) {
        return this.bingoService.deleteEvent(id);
    }

    @Get('events/:eventId/cartons/available')
    @ApiOperation({ summary: 'Obtener cartones disponibles de un evento' })
    @ApiResponse({ status: 200, description: 'Lista de cartones disponibles obtenida exitosamente' })
    async getAvailableCartons(@Param('eventId') eventId: string) {
        return this.bingoService.getAvailableCartons(eventId);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Actualizar el estado de un evento de bingo' })
    @ApiResponse({ status: 200, description: 'Estado del evento actualizado exitosamente' })
    async updateEventStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateBingoEventStatusDto) {
        return this.bingoService.updateEventStatus(id, updateStatusDto);
    }

    /* Cartons  */

    @Get('events/:eventId/cartons/available')
    @ApiOperation({ summary: 'Obtener cartones disponibles de un evento' })
    @ApiResponse({ status: 200, description: 'Lista de cartones disponibles obtenida exitosamente' })
    async getCartonsByEventId(@Param('eventId') eventId: string) {
        return this.bingoService.getCartonsByEventId(eventId);
    }

 

    @Get('tickets/user/cartons-available/:userId/:eventId')
    @ApiOperation({ summary: 'Obtener tickets comprados por el usuario' })
    @ApiResponse({ status: 200, description: 'Lista de tickets obtenida exitosamente' })
    async getUserTickets(@Param('userId') userId: string, @Param('eventId') eventId: string) {
        return this.bingoService.getCartonsTicketsForIdUser(userId, eventId);
    }
}
