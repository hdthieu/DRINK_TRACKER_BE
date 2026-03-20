import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

export class LoginDto {
    @IsEmail({}, { message: 'Email không hợp lệ 🌸' })
    @IsNotEmpty({ message: 'Email không được để trống 🌸' })
    email: string;

    @IsString()
    @Length(6, 6, { message: 'Mã OTP phải có đúng 6 chữ số 🌸' })
    otp: string;
}