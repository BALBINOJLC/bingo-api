import { JwtService } from '@nestjs/jwt';

export class CommonAuthServise {
    constructor(private jwtService: JwtService) {}

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public createJwtPayload(data: any): { expiresIn: number; token: string } {
        try {
            const jwt = this.jwtService.sign(data);

            return {
                expiresIn: 3600 * 24 * 30, // 30 días en segundos (60*60*24*30)
                token: jwt,
            };
        } catch (error) {
            console.dir(error, { depth: null });

            throw error;
        }
    }
}
