import mongoose from 'mongoose';
import { Types } from 'mongoose';
import type { Query } from 'mongoose';
import type { HydratedDocument, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

const { model, models, Schema } = mongoose;

interface IUser {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  passwordConfirm?: string;
  passwordChangedAt?: Date;
  preferences: Map<string, number>;
  cuisineWeights: Map<string, number>;
  groups: Types.ObjectId[];
  active?: boolean;
  id?: string;
  fullName?: string;
  correctPassword: (
    candidatePassword: string,
    userPassword: string
  ) => Promise<boolean>;
  changedPasswordAfter: (JWTTimestamp: number) => boolean;
}

export type UserDoc = HydratedDocument<IUser>;

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    passwordChangedAt: Date,
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    preferences: {
      type: Map,
      of: Number,
      default: () =>
        new Map([
          ['Chinese', 1],
          ['Korean', 1],
          ['Japanese', 1],
          ['Italian', 1],
          ['Mexican', 1],
          ['Indian', 1],
          ['Thai', 1],
          ['French', 1],
          ['Muslim', 1],
          ['Vietnamese', 1],
          ['Western', 1],
          ['Fast Food', 1],
        ]),
    },
    cuisineWeights: { 
      type: Map,
      of: Number,
      default: () =>
        new Map([
          ['Chinese', 1.0],
          ['Korean', 1.0],
          ['Japanese', 1.0],
          ['Italian', 1.0],
          ['Mexican', 1.0],
          ['Indian', 1.0],
          ['Thai', 1.0],
          ['French', 1.0],
          ['Muslim', 1.0],
          ['Vietnamese', 1.0],
          ['Western', 1.0],
          ['Fast Food', 1.0],
        ]),
    },
    groups: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Group',
        },
      ],
      default: [],
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
    timestamps: true,
    versionKey: false,
  }
);

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.pre<HydratedDocument<IUser>>('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.pre<HydratedDocument<IUser>>('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

userSchema.pre<Query<any, IUser>>(/^find/, function (next) {
  this.find({ active: true });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (
  this: HydratedDocument<IUser>,
  JWTTimestamp: number
) {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(
      this.passwordChangedAt.getTime() / 1000
    );

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

export const User =
  (models.User as Model<IUser>) || model<IUser>('User', userSchema);

