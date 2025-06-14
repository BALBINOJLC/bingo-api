import { IsString, IsNumber, IsEnum, IsOptional, Min, IsInt } from 'class-validator';
import { EBingoStatus } from '@prisma/client';

export class CreateBingoEventDto {
    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsString()
    start_date: string;


    @IsString()
    time_start: string;

    @IsString()
    time_end: string;


    @IsEnum(EBingoStatus)
    status: EBingoStatus;

    @IsNumber()
    @Min(0)
    prize_pool: number;


    @IsInt()
    @Min(1)
    total_cartons: number;

    @IsString()
    image_url: string;

    @IsNumber()
    @Min(0)
    price_cardboard: number;
}

export class BingoEventResponseDto {
    id: string;
    name: string;
    description: string;
    start_date: string;
    time_start: string;
    status: EBingoStatus;
    prize_pool: number;
    created_at: Date;
    updated_at: Date;
}

export class BingoEventQueryDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(EBingoStatus)
    status?: EBingoStatus;

    @IsOptional()
    @IsString()
    user_id?: string;
}

export class PurchaseTicketDto {
    @IsString()
    user_id: string;

    @IsNumber()
    carton_id: number;

    @IsString()
    amount_payment: string;

    @IsString()
    reference_payment: string;

    @IsString()
    number_payment: string;
}

export class PurchaseTicketSuperAdminDto {
    @IsString()
    user_id: string;

    @IsNumber()
    carton_id: number;


}

export class UpdateBingoEventStatusDto {
    @IsEnum(EBingoStatus)
    @IsOptional()
    status: EBingoStatus;
    
    @IsString()
    @IsOptional()
    name: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsString()
    @IsOptional()
    start_date: string;

    @IsString()
    @IsOptional()
    time_start: string;

    @IsString()
    @IsOptional()
    time_end: string;

    @IsNumber()
    @IsOptional()
    prize_pool: number;

    @IsString()
    @IsOptional()
    image_url: string;

} 