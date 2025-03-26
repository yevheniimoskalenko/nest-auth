import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tokens } from './entities/token.entity';
@Injectable()
export class AuthService {
  constructor(@InjectModel(Tokens.name) private tokensModel: Model<Tokens>) {}
  async saveToken(userId, token: string) {
    try {
      const newToken = new this.tokensModel({
        user: userId,
        token,
      });
      return await newToken.save();
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  findAll() {
    return `This action returns all auth`;
  }

  async findOneByToken(token: string) {
    try {
      return await this.tokensModel.findOne({ token: token });
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  async update(id, token: string) {
    try {
      const updateToken = await this.tokensModel.findOne({ user: id });
      if (updateToken) {
        return await this.tokensModel.updateOne(
          { _id: updateToken._id },
          { token },
        );
      } else {
        return await this.saveToken(id, token);
      }
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
