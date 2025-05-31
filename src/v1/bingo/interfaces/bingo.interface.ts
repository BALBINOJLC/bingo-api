import { EBingoStatus } from '@prisma/client';

export interface IBingoEvent {
    id: string;
    name: string;
    description: string;
    start_date: Date;
    end_date: Date;
    status: EBingoStatus;
    prize_pool: number;
    commission: number;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
    is_deleted: boolean;
}

export interface ICarton {
    id: string;
    number: number;
    status: string;
    event_id: string;
    numbers: number[];
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
    is_deleted: boolean;
}

export interface ITicket {
    id: string;
    status: string;
    price: number;
    user_id: string;
    event_id: string;
    carton_id: string;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
    is_deleted: boolean;
} 