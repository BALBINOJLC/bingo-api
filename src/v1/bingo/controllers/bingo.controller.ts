import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Patch, Req } from '@nestjs/common';
import { BingoService } from '../services/bingo.service';
import {
    CreateBingoEventDto,
    BingoEventQueryDto,
    PurchaseTicketDto,
    UpdateBingoEventStatusDto,
    PurchaseTicketSuperAdminDto,
} from '../dtos/bingo.dto';
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

    @Get('users')
    @ApiOperation({ summary: 'Obtener tickets de un evento' })
    @ApiResponse({ status: 200, description: 'Lista de tickets obtenida exitosamente' })
    async getUsersTicketsByEventId() {
        return this.bingoService.getUsersEvents();
    }

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
    async getEventsAvailable(@Param('status') status: string) {
        return this.bingoService.getEventsByStatus(status);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los eventos de bingo' })
    @ApiResponse({ status: 200, description: 'Lista de eventos obtenida exitosamente' })
    async getEvents(@Query() query: BingoEventQueryDto) {
        return this.bingoService.getEvents(query);
    }

    @Get('event/:id')
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

    @Post('events/:eventId/cartons')
    @ApiOperation({ summary: 'Crear cartones para un evento' })
    @ApiResponse({ status: 200, description: 'Cartones creados exitosamente' })
    async createCartonsForEvent(@Param('eventId') eventId: string, @Body() { price, quantity }: { price: number; quantity: number }) {
        return this.bingoService.createCartonForEvent(eventId, price, quantity);
    }

    @Get('tickets/user/cartons-available/:userId/:eventId')
    @ApiOperation({ summary: 'Obtener tickets comprados por el usuario' })
    @ApiResponse({ status: 200, description: 'Lista de tickets obtenida exitosamente' })
    async getUserTickets(@Param('userId') userId: string, @Param('eventId') eventId: string) {
        return this.bingoService.getCartonsTicketsForIdUser(userId, eventId);
    }

    @Get('tickets/user/:userId')
    @ApiOperation({ summary: 'Obtener tickets comprados por el usuario' })
    @ApiResponse({ status: 200, description: 'Lista de tickets obtenida exitosamente' })
    async getUserTicketsByUserId(@Param('userId') userId: string) {
        return this.bingoService.getTicketsByUserId(userId);
    }

    /* Tickets purchase and cartons */
    @Get('tickets/event/:eventId')
    @ApiOperation({ summary: 'Obtener tickets de un evento' })
    @ApiResponse({ status: 200, description: 'Lista de tickets obtenida exitosamente' })
    async getTicketsByEventId(@Param('eventId') eventId: string) {
        return this.bingoService.getsTicketsByEventId(eventId);
    }

    @Patch('tickets-cartons/event/:ticketId')
    @ApiOperation({ summary: 'Obtener tickets de un evento' })
    @ApiResponse({ status: 200, description: 'Lista de tickets obtenida exitosamente' })
    async updatedStatusTicketsAndCartons(@Param('ticketId') ticketId: string) {
        return this.bingoService.updatedStatusTicketsAndCartons(ticketId);
    }

    @Post('tickets/purchase/super_admin')
    @ApiOperation({ summary: 'Comprar un ticket de bingo' })
    @ApiResponse({ status: 201, description: 'Ticket comprado exitosamente' })
    async purchaseTicketSuperAdmin(@Body() purchaseTicketDto: PurchaseTicketSuperAdminDto) {
        return this.bingoService.purchaseTicketSuperAdmin(purchaseTicketDto);
    }

    /* LIVE BINGO */
    @Get('live-bingo/participants/:eventId')
    @ApiOperation({ summary: 'Obtener participantes de un evento' })
    @ApiResponse({ status: 200, description: 'Lista de participantes obtenida exitosamente' })
    async getParticipants(@Param('eventId') eventId: string) {
        return this.bingoService.getTicketsByEventId(eventId);
    }



    @Get('events/:eventId/next-number')
    async getNextNumber(@Param('eventId') eventId: string) {
        return this.bingoService.getProximoNumberEvent(eventId);
    }

    @Get('events-numbers/:eventId/numbers')
    async getEventNumbers(@Param('eventId') eventId: string) {
        return this.bingoService.getEventNumbers(eventId);
    }
}
