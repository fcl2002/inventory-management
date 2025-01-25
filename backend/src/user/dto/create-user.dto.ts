import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class CreateUserDto {
    @IsEmail({}, { message: 'E-mail inválido. '})
    userEmail: string;

    @IsNotEmpty({ message: 'A senha é obrigatória' })
    @MinLength(8, {message: 'A senha deve ter no mínimo 8 caracteres. '})
    userPassword: string;
    
    @IsNotEmpty({ message: 'O nome é obrigatório' })
    userName: string;
    
    @IsNotEmpty({ message: 'O nome do ponto de venda é obrigatório' })
    shopName: string;
    
    @IsNotEmpty({ message: 'A sigla do ponto de venda é obrigatória' })
    shopAcronym: string;

    @IsNotEmpty({ message: 'A cidade do ponto de venda é obrigatória' })
    shopCity: string;
}
  