import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@prisma';
import {
    CreateBingoEventDto,
    BingoEventQueryDto,
    PurchaseTicketDto,
    UpdateBingoEventStatusDto,
    PurchaseTicketSuperAdminDto,
} from '../dtos/bingo.dto';
import { EBingoStatus, ECartonStatus, ETicketStatus, Prisma } from '@prisma/client';
import axios from 'axios';
import { getAllJSDocTagsOfKind } from 'typescript';
interface BingoWinner {
    cartonId: number;
    userId: string;
    userName: string;
    ticketId: string;
}
@Injectable()
export class BingoService {
    constructor(private readonly prisma: PrismaService) {}

    async createEvent(createBingoEventDto: CreateBingoEventDto) {
        const { total_cartons, ...eventData } = createBingoEventDto;

        // Primero generamos los números del evento
        const eventNumbers = this.generateBingoNumbers();
        
        // Creamos el evento
        const newEvent = await this.prisma.bingoEvent.create({
            data: {
                name: eventData.name,
                description: eventData.description,
                start_date: eventData.start_date,
                time_start: eventData.time_start,
                status: eventData.status,
                prize_pool: eventData.prize_pool,
                image_url: eventData.image_url,
                time_end: eventData.time_end,
                total_cartons: total_cartons,
                price_cardboard: createBingoEventDto.price_cardboard,
                numbers: eventNumbers,
            },
            include: {
                cartons: true,
            },
        });

        // Generamos cartones ganadores primero
        const winningCartons = this.generateWinningCartons(eventNumbers, 2); // Generamos 2 cartones ganadores

        // Creamos los cartones ganadores
        for (const winningNumbers of winningCartons) {
            await this.prisma.carton.create({
                data: {
                    status: ECartonStatus.AVAILABLE,
                    numbers: winningNumbers,
                    event: { connect: { id: newEvent.id } },
                    price: createBingoEventDto.price_cardboard.toString(),
                },
            });
        }

        // Creamos el resto de los cartones
        const remainingCartons = total_cartons - winningCartons.length;
        for (let i = 0; i < remainingCartons; i++) {
            await this.prisma.carton.create({
                data: {
                    status: ECartonStatus.AVAILABLE,
                    numbers: this.generateBingoNumbers(),
                    event: { connect: { id: newEvent.id } },
                    price: createBingoEventDto.price_cardboard.toString(),
                },
            });
        }

        return newEvent;
    }

    private generateWinningCartons(eventNumbers: number[], count: number): number[][] {
        const winningCartons: number[][] = [];
        const usedNumbers = new Set<number>();

        for (let i = 0; i < count; i++) {
            const cartonNumbers: number[] = [];
            const availableNumbers = [...eventNumbers].filter(n => !usedNumbers.has(n));

            // Seleccionamos 12 números del evento para el cartón ganador
            for (let j = 0; j < 12; j++) {
                const randomIndex = Math.floor(Math.random() * availableNumbers.length);
                const selectedNumber = availableNumbers[randomIndex];
                cartonNumbers.push(selectedNumber);
                usedNumbers.add(selectedNumber);
                availableNumbers.splice(randomIndex, 1);
            }

            // Ordenamos los números
            cartonNumbers.sort((a, b) => a - b);
            winningCartons.push(cartonNumbers);
        }

        return winningCartons;
    }

    private generateBingoNumbers(): number[] {
        const numbers: number[] = [];
        const columns = [
            { min: 1, max: 9 },     // Primera columna (1-9)
            { min: 10, max: 19 },   // Segunda columna (10-19)
            { min: 20, max: 29 },   // Tercera columna (20-29)
            { min: 30, max: 39 },   // Cuarta columna (30-39)
            { min: 40, max: 49 },   // Quinta columna (40-49)
            { min: 50, max: 59 },   // Sexta columna (50-59)
            { min: 60, max: 69 },   // Séptima columna (60-69)
            { min: 70, max: 79 },   // Octava columna (70-79)
            { min: 80, max: 90 },   // Novena columna (80-90)
        ];

        // Para cada columna, decidir cuántos números tendrá (1-3 números por columna)
        for (let col = 0; col < 9; col++) {
            const numbersInColumn = Math.floor(Math.random() * 3) + 1; // 1-3 números
            const columnNumbers = new Set<number>();
            
            while (columnNumbers.size < numbersInColumn) {
                const num = Math.floor(Math.random() * (columns[col].max - columns[col].min + 1)) + columns[col].min;
                columnNumbers.add(num);
            }
            numbers.push(...Array.from(columnNumbers));
        }

        // Asegurar que el cartón tenga exactamente 12 números
        while (numbers.length > 12) {
            numbers.pop();
        }
        while (numbers.length < 12) {
            const col = Math.floor(Math.random() * 9);
            const num = Math.floor(Math.random() * (columns[col].max - columns[col].min + 1)) + columns[col].min;
            if (!numbers.includes(num)) {
                numbers.push(num);
            }
        }

        // Ordenar los números
        numbers.sort((a, b) => a - b);

        return numbers;
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

    async getEventsByStatus(status: string) {
        const events = await this.prisma.bingoEvent.findMany({
            where: { status: status as EBingoStatus, is_deleted: false },
            include: {
                cartons: {
                    include: { Ticket: true },
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
                price: true,
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
                ...updateStatusDto,
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

    async getAllEvents() {
        const events = await this.prisma.bingoEvent.findMany({
            where: {
                is_deleted: false,
            },
            include: {
                cartons: {
                    include: {
                        Ticket: {
                            where: {
                                is_deleted: false,
                            },
                        },
                    },
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        return events;
    }

    async getCartonsByEventId(eventId: string) {
        const cartons = await this.prisma.carton.findMany({
            where: {
                event_id: eventId,
                status: ECartonStatus.AVAILABLE,
            },
        });

        return cartons;
    }

    async getsTicketsByEventId(eventId: string) {
        const tickets = await this.prisma.ticket.findMany({
            where: {
                event_id: eventId,
            },
            include: {
                carton: true,
            },
        });

        return tickets;
    }

    async updatedStatusTicketsAndCartons(ticketId: string) {
        const ticket = await this.prisma.ticket.update({
            where: {
                id: ticketId,
            },
            data: {
                status: ETicketStatus.SOLD,
            },
        });

        await this.prisma.carton.update({
            where: {
                id: ticket.carton_id,
            },
            data: {
                status: ECartonStatus.SOLD,
            },
        });

        return {
            message: 'Tickets y cartones actualizados exitosamente',
        };
    }

    async createCartonForEvent(eventId: string, price: number, quantity: number) {
        for (let i = 0; i < quantity; i++) {
            await this.prisma.carton.create({
                data: {
                    event_id: eventId,
                    price: price.toString(),
                    numbers: this.generateBingoNumbers(),
                    status: ECartonStatus.AVAILABLE,
                },
            });
        }
        const event = await this.prisma.bingoEvent.findFirst({
            where: {
                id: eventId,
            },
        });
        await this.prisma.bingoEvent.update({
            where: { id: eventId },
            data: {
                total_cartons: event.total_cartons + quantity,
            },
        });
        return { message: 'Cartones creados exitosamente' };
    }

    async getCartonsTicketsForIdUser(userId: string, eventId: string) {
        const tickets = await this.prisma.ticket.findMany({
            where: {
                user_id: userId,
                is_deleted: false,
                event_id: eventId,
            },
            include: {
                carton: true,
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        // Extraer los cartones de los tickets
        const cartons = tickets.map((ticket) => ticket.carton);

        return cartons;
    }

    async getTicketsByUserId(userId: string) {
        const tickets = await this.prisma.ticket.findMany({
            where: {
                user_id: userId,
                is_deleted: false,
            },
            include: {
                carton: {
                    include: {
                        event: true,
                    },
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        return tickets;
    }

    /* Users */

    async getUsersEvents() {
        const users = await this.prisma.user.findMany({
            where: {
                is_deleted: false,
            },
        });
        return users;
    }

    async purchaseTicketSuperAdmin(purchaseTicketDto: PurchaseTicketSuperAdminDto) {
        const { user_id, carton_id } = purchaseTicketDto;

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
                    status: ETicketStatus.SOLD,
                    user: { connect: { id: user_id } },
                    carton: { connect: { id: carton_id } },
                    event: { connect: { id: carton.event_id } },
                    reference_payment: 'SUPER_ADMIN',
                    number_payment: 'SUPER_ADMIN',
                    amount_payment: carton.price,
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

    async getTicketsByEventId(eventId: string) {
        const tickets = await this.prisma.ticket.findMany({
            where: { event_id: eventId },
            include: {
                user: true,
                carton: true,
            },
        });

        return tickets;
    }

    async getProximoNumberEvent(eventId: string) {
        const event = await this.prisma.bingoEvent.findFirst({
            where: { id: eventId },
        });

        if (!event || !event.numbers || event.numbers.length === 0) {
            throw new Error('No hay más números disponibles');
        }

        const nextNumber = event.numbers[0];

        // Actualizar el evento removiendo el número usado
        await this.prisma.bingoEvent.update({
            where: { id: eventId },
            data: {
                numbers: event.numbers.slice(1),
            },
        });

        return {
            number: nextNumber,
            remainingNumbers: event.numbers.length - 1,
        };
    }

    async getEventNumbers(eventId: string) {
        const event = await this.prisma.bingoEvent.findFirst({
            where: { id: eventId },
        });

        return event.numbers;
    }

    async checkBingoWinners(eventId: string): Promise<BingoWinner[]> {
        const event = await this.prisma.bingoEvent.findFirst({
            where: { 
                id: eventId,
                is_deleted: false 
            },
            include: {
                cartons: {
                    where: {
                        status: ECartonStatus.SOLD,
                    },
                    include: {
                        Ticket: {
                            where: {
                                status: ETicketStatus.SOLD
                            },
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        display_name: true
                                    }
                                }
                            }
                        },
                    },
                },
            },
        });

        if (!event) {
            throw new NotFoundException('Evento no encontrado');
        }

        const winningCartons: BingoWinner[] = [];
        const calledNumbers = new Set(event.numbers);

        for (const carton of event.cartons) {
            // Verificar que el cartón tenga un ticket asociado
            if (!carton.Ticket) continue;

            if (this.isBingoWinner(carton.numbers, calledNumbers)) {
                winningCartons.push({
                    cartonId: carton.id,
                    userId: carton.Ticket.user.id,
                    userName: carton.Ticket.user.display_name,
                    ticketId: carton.Ticket.id
                });
            }
        }

        return winningCartons;
    }

    private isBingoWinner(cartonNumbers: number[], calledNumbers: Set<number>): boolean {
        return cartonNumbers.every(number => 
            number === 0 || calledNumbers.has(number)
        );
    }
}
