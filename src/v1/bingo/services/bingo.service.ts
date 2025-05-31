import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@prisma';
import { CreateBingoEventDto, BingoEventQueryDto, PurchaseTicketDto, UpdateBingoEventStatusDto } from '../dtos/bingo.dto';
import { EBingoStatus, ECartonStatus, ETicketStatus, Prisma } from '@prisma/client';
import axios from 'axios';
import { getAllJSDocTagsOfKind } from 'typescript';

@Injectable()
export class BingoService {
    constructor(private readonly prisma: PrismaService) {}

    async createEvent(createBingoEventDto: CreateBingoEventDto) {
        const { total_cartons, ...eventData } = createBingoEventDto;

        // Crear el evento de bingo con transacción
        const event = await this.prisma.$transaction(async (prisma) => {
            // Crear el evento
            const newEvent = await prisma.bingoEvent.create({
                data: {
                    ...eventData,
                    cartons: {
                        create: Array.from({ length: total_cartons }, (_, i) => ({
                            status: ECartonStatus.AVAILABLE,
                            numbers: this.generateBingoNumbers(),
                        })),
                    },
                    numbers: this.generateBingoNumbers(),
                },
                include: {
                    cartons: true,
                },
            });

            return newEvent;
        });

        return event;
    }

    async getEvents(query: BingoEventQueryDto) {
        const { search, status, user_id } = query;

        const where: Prisma.BingoEventWhereInput = {
            is_deleted: false,
            ...(status && { status }),
            ...(search && {
                OR: [
                    { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
                    { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
                ],
            }),
        };

        const events = await this.prisma.bingoEvent.findMany({
            where,
            include: {
                cartons: {
                    include: {
                        Ticket: user_id
                            ? {
                                  where: {
                                      user_id,
                                      is_deleted: false,
                                  },
                              }
                            : undefined,
                    },
                },
            },
        });

        return events;
    }

    async getEvent(id: string) {
        const event = await this.prisma.bingoEvent.findFirst({
            where: {
                id,
                is_deleted: false,
            },
            include: {
                cartons: {
                    include: { Ticket: true },
                },
            },
        });

        if (!event) {
            throw new NotFoundException('Evento no encontrado');
        }

        return event;
    }

    async deleteEvent(id: string) {
        // Verificar si el evento tiene tickets vendidos
        const event = await this.prisma.bingoEvent.findFirst({
            where: {
                id,
                is_deleted: false,
            },
            include: {
                tickets: {
                    where: {
                        is_deleted: false,
                    },
                },
            },
        });

        if (!event) {
            throw new NotFoundException('Evento no encontrado');
        }

        if (event.tickets.length > 0) {
            throw new BadRequestException('No se puede eliminar un evento con tickets vendidos');
        }

        // Eliminar el evento (soft delete)
        return this.prisma.bingoEvent.update({
            where: { id },
            data: {
                is_deleted: true,
                deleted_at: new Date(),
            },
        });
    }

    private generateBingoNumbers(): number[] {
        const numbers: number[] = [];
        const columns = [
            { min: 1, max: 20 }, // Primera columna
            { min: 21, max: 40 }, // Segunda columna
            { min: 41, max: 60 }, // Tercera columna
            { min: 61, max: 80 }, // Cuarta columna
            { min: 81, max: 100 }, // Quinta columna
        ];

        for (let col = 0; col < 5; col++) {
            const columnNumbers = new Set<number>();
            while (columnNumbers.size < 5) {
                const num = Math.floor(Math.random() * (columns[col].max - columns[col].min + 1)) + columns[col].min;
                columnNumbers.add(num);
            }
            numbers.push(...Array.from(columnNumbers));
        }

        // Reemplazar el número central con 0 (espacio libre)
        numbers[12] = 0;

        return numbers;
    }

    async purchaseTicket(purchaseTicketDto: PurchaseTicketDto) {
        const { user_id, carton_id, amount_payment, reference_payment, number_payment } = purchaseTicketDto;

        return this.prisma.$transaction(async (prisma) => {
            // Verificar si el cartón está disponible
            const carton = await prisma.carton.findFirst({
                where: {
                    id: carton_id,
                    status: ECartonStatus.AVAILABLE,
                },
                include: {
                    event: true,
                },
            });

            if (!carton) {
                throw new NotFoundException('Cartón no disponible');
            }

            // Crear el ticket
            const ticket = await prisma.ticket.create({
                data: {
                    status: ETicketStatus.PROCESSING_SOLD,
                    user: { connect: { id: user_id } },
                    carton: { connect: { id: carton_id } },
                    event: { connect: { id: carton.event_id } },
                    reference_payment,
                    number_payment,
                    amount_payment,
                },
            });

            // Actualizar el estado del cartón
            await prisma.carton.update({
                where: { id: carton_id },
                data: { status: ECartonStatus.PROCESSING_SOLD },
            });

            return ticket;
        });
    }

    async getAvailableCartons(eventId: string) {
        const cartons = await this.prisma.carton.findMany({
            where: {
                event_id: eventId,
                status: ECartonStatus.AVAILABLE,
            },
            select: {
                id: true,
                numbers: true,
                status: true,
            },
        });

        if (!cartons.length) {
            throw new NotFoundException('No hay cartones disponibles para este evento');
        }

        return cartons;
    }

    async updateEventStatus(id: string, updateStatusDto: UpdateBingoEventStatusDto) {
        const event = await this.prisma.bingoEvent.findFirst({
            where: {
                id,
                is_deleted: false,
            },
        });

        if (!event) {
            throw new NotFoundException('Evento no encontrado');
        }

        return this.prisma.bingoEvent.update({
            where: { id },
            data: {
                status: updateStatusDto.status,
            },
        });
    }

    async validateTicketsPayments() {
        const tickets = await this.prisma.ticket.findMany({
            where: {
                status: ETicketStatus.PROCESSING_SOLD,
            },
        });

        for (const ticket of tickets) {
            try {
                const response = await axios.get(
                    `https://flows.sicrux.app/webhook/c89345a3-89a1-4668-8563-f3399002a96d/validationsPayments/${ticket.amount_payment}/${ticket.reference_payment}/${ticket.number_payment}`
                );

                if (response.data.success) {
                    // Actualizar el ticket a SOLD
                    await this.prisma.ticket.update({
                        where: { id: ticket.id },
                        data: { status: ETicketStatus.SOLD },
                    });

                    // Actualizar el cartón a SOLD
                    await this.prisma.carton.update({
                        where: { id: ticket.carton_id },
                        data: { status: ECartonStatus.SOLD },
                    });

                    await this.prisma.payments.create({
                        data: {
                            reference_payment: ticket.reference_payment,
                            number_payment: ticket.number_payment,
                            amount_payment: ticket.amount_payment,
                            validations_response: response.data,
                            user: { connect: { id: ticket.user_id } },
                            created_at: new Date(),
                            updated_at: new Date(),
                            deleted_at: null,
                            is_deleted: false,
                        },
                    });
                } 
            } catch (error) {
                await this.prisma.ticket.update({
                    where: { id: ticket.id },
                    data: { error_logs: error },
                });
            }
        }

        return tickets;
    }
}
