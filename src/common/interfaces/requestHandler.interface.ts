import { Request } from '@nestjs/common';

export declare type TRequestHandler = typeof Request & { user };
