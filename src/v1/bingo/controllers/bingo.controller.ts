import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Patch } from '@nestjs/common';
import { BingoService } from '../services/bingo.service';
import { CreateBingoEventDto, BingoEventQueryDto, PurchaseTicketDto, UpdateBingoEventStatusDto } from '../dtos/bingo.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common';


@ApiTags('BINGO')
@Controller({
    version: '1',
    path: 'bingo',
})
@UseGuards(JwtAuthGuard)
export class BingoController {
    constructor(private readonly bingoService: BingoService) {}

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo evento de bingo' })
    @ApiResponse({ status: 201, description: 'Evento creado exitosamente' })
    async createEvent(@Body() createBingoEventDto: CreateBingoEventDto) {
        return this.bingoService.createEvent(createBingoEventDto);
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

    @Post('tickets/purchase')
    @ApiOperation({ summary: 'Comprar un ticket de bingo' })
    @ApiResponse({ status: 201, description: 'Ticket comprado exitosamente' })
    async purchaseTicket(@Body() purchaseTicketDto: PurchaseTicketDto) {
        return this.bingoService.purchaseTicket(purchaseTicketDto);
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
    async updateEventStatus(
        @Param('id') id: string,
        @Body() updateStatusDto: UpdateBingoEventStatusDto,
    ) {
        return this.bingoService.updateEventStatus(id, updateStatusDto);
    }
}
