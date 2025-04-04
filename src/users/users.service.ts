import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Users } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface JwtTokens {
  access_token: string;
  refresh_token: string;
}

type UserJwt = {
  id: any;
  email: string;
  firstName: string;
  lastName: string;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Users.name) private usersModel: Model<Users>,
    private readonly JwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(5);
    return bcrypt.hash(password, salt);
  }
  checkPassword(password: string, hashPassword: string) {
    return bcrypt.compare(password, hashPassword);
  }
  async create(createUserDto: CreateUserDto): Promise<Users> {
    try {
      const password = await this.hashPassword(createUserDto.password);
      const user = new this.usersModel({
        ...createUserDto,
        password,
      });
      return await user.save();
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  async findByEmail(email: string): Promise<Users | null> {
    try {
      return await this.usersModel.findOne({ email: email });
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  public generateJwtToken(user: Partial<UserJwt>): JwtTokens {
    try {
      const payload = { ...user };
      const access_token = this.JwtService.sign(payload, {
        secret: 'secret',
        expiresIn: '15m',
      });

      const refresh_token = this.JwtService.sign(payload, {
        secret: 'extraSecret',
        expiresIn: '30d',
      });

      return { access_token, refresh_token };
    } catch (e) {
      throw new UnauthorizedException({ message: e.message });
    }
  }

  async findMe(userId): Promise<Users | null> {
    try {
      return await this.usersModel.findOne(
        { _id: userId },
        { email: true, firstName: true, lastName: true },
      );
    } catch (e) {
      throw new UnauthorizedException({ message: e.message });
    }
  }

  async logout(refresh: string) {
    try {
      const tokenData = await this.usersModel.findOne({
        where: { token: refresh },
      });
      if (tokenData) {
        return await this.usersModel.deleteOne({ _id: tokenData.id });
      } else {
        throw new UnauthorizedException({ message: 'error token not found' });
      }
    } catch (e) {
      throw new UnauthorizedException({ message: e.message });
    }
  }
}
