import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import { Users } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Users.name) private usersModel: Model<Users>,
    // private readonly users: Repository<Users>,
    // @InjectModel(Users) private users: Model<Users>,
    private readonly JwtService: JwtService,
  ) {}

  async hashPassword(password: string): Promise<string | null> {
    const salt = await bcrypt.genSalt(5);
    return await bcrypt.hash(password, salt);
  }
  async checkPassword(password: string, hashPassword: string) {
    return await bcrypt.compare(password, hashPassword);
  }
  async create(createUserDto: CreateUserDto): Promise<Users> {
    try {
      const password = await this.hashPassword(createUserDto.password);

      const user = new this.usersModel({
        ...createUserDto,
        password: password,
      });
      return await user.save();
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  async findAll() {
    // return await this.users.find();
  }

  async findByEmail(email: string) {
    try {
      return await this.usersModel.findOne({ email: email });
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  public async generateJwtToken(
    user,
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const payload = { ...user };
      const access_token = await this.JwtService.sign(payload, {
        secret: 'secret',
        expiresIn: '15m',
      });

      const refresh_token = await this.JwtService.sign(payload, {
        secret: 'extraSecret',
        expiresIn: '30d',
      });

      return { access_token, refresh_token };
    } catch (e) {
      throw new UnauthorizedException({ message: e.message });
    }
  }

  async findMe(userId) {
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
