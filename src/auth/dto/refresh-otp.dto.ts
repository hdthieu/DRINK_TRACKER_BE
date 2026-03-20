import { IsNotEmpty, IsString } from "class-validator";

export class RefreshTokenDto {
    @IsNotEmpty({ message: 'Refresh Token là bắt buộc 🌸' })
    @IsString()
    refresh_token: string;
}
