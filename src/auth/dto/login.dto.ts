import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

export class LoginDto {
    @IsEmail({}, { message: 'Email không hợp lệ' })
    @IsNotEmpty({ message: 'Email không được để trống' })
    email: string;
}