import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  BadRequestException,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateAuthDto } from './dto/create-auth.dto';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('sign-up')
  private async signUp(@Body() createAuthDto: CreateAuthDto) {
    try {
      const candidate = await this.usersService.findByEmail(
        createAuthDto.email,
      );

      if (candidate) throw new BadRequestException('user was found');
      const user = await this.usersService.create(createAuthDto);

      const tokens = await this.usersService.generateJwtToken({
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
      await this.authService.saveToken(user._id, tokens.refresh_token);
      return { user, data: tokens };
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  @Post('sign-in')
  private async signIn(@Body() createAuthDto: CreateAuthDto) {
    try {
      const candidate = await this.usersService.findByEmail(
        createAuthDto.email,
      );
      if (candidate) {
        const checkPassword = await this.usersService.checkPassword(
          createAuthDto.password,
          candidate.password,
        );
        if (checkPassword) {
          const tokens = await this.usersService.generateJwtToken({
            id: candidate._id,
            email: candidate.email,
          });
          await this.authService.update(candidate._id, tokens.refresh_token);
          return {
            data: {
              tokens: { ...tokens },
            },
          };
        } else {
          throw new BadRequestException('password is incorrect');
        }
      } else {
        throw new BadRequestException('user not found');
      }
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  @Get('logout')
  async logout(@Req() req, @Res() res) {
    try {
      const { refresh_token } = req.cookies;
      await this.usersService.logout(refresh_token);
      res.json({});
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('refresh')
  async refresh(@Query('token') token, @Req() req, @Res() res) {
    try {
      const userData = await this.authService.findOneByToken(token);
      const userFromDB = await this.usersService.findMe(userData?.user);
      if (!userFromDB || !userData) {
        throw new UnauthorizedException('user not found or smth error');
      }
      const tokens = this.usersService.generateJwtToken({
        id: userFromDB._id,
        email: userFromDB.email,
        firstName: userFromDB.firstName,
        lastName: userFromDB.lastName,
      });

      await this.authService.update(userFromDB._id, tokens.refresh_token);
      res.status(200).json({
        data: {
          tokens,
        },
      });
    } catch (e) {
      console.log(e);
      throw new BadRequestException(e.message);
    }
  }
}
