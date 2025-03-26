import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { Tokens, TokensSchema } from './entities/token.entity';
import { UsersModule } from '../users/users.module';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tokens.name, schema: TokensSchema }]),
    forwardRef(() => UsersModule),
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule],
})
export class AuthModule {}
