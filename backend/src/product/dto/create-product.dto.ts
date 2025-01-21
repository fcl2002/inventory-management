const { IsString, IsNumber, IsOptional } = require('class-validator');

export class CreateProductDto {
  @IsString()
  name;

  @IsNumber()
  price;

  @IsString()
  @IsOptional()
  description;
}
