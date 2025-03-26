import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @ApiProperty({ example: 'test@gmail.com', description: '' })
  readonly email: string;
  @IsString({ message: '' })
  @ApiProperty({ example: '12345', description: '' })
  readonly password: string;
  @IsString({ message: '' })
  @ApiProperty({ example: 'Yevhenii', description: '' })
  readonly firstName: string;
  @IsString({ message: '' })
  @ApiProperty({ example: 'Moskalenko', description: '' })
  readonly lastName: string;
}
