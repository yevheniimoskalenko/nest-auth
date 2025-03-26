import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import * as mongoose from 'mongoose';
export type TokensDocument = HydratedDocument<Tokens>;
import { Users } from '../../users/entities/user.entity';

@Schema()
export class Tokens {
  _id: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users' })
  user: Users;

  @Prop()
  token: string;
}

export const TokensSchema = SchemaFactory.createForClass(Tokens);
