import { IsNotEmpty, IsString } from "class-validator";

export class MyProfileDto {
    @IsString()
    @IsNotEmpty()
    userId: string;
}