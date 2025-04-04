import {
  Controller,
  Get,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  async findMe(@Req() req) {
    try {
      const user = await this.usersService.findMe(req.user.id);
      return {
        data: {
          id: user?._id,
          email: user?.email,
          firstName: user?.firstName,
          lastName: user?.lastName,
        },
      };
    } catch (err) {
      throw new BadRequestException(err);
    }
  }
}
