import mongoose from 'mongoose';
import { Types } from 'mongoose';
import type { Query } from 'mongoose';
import type { HydratedDocument, Model } from 'mongoose';

const { model, models, Schema } = mongoose;

interface IGroup {
  name: string;
  code: string;
  description?: string;
  users: {
    user: Types.ObjectId;
    role: 'admin' | 'member';
  }[];
  active: boolean;
  userCount: number;
}

export type GroupDoc = HydratedDocument<IGroup>;

const groupSchema = new Schema<IGroup>(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
    },
    code: {
      type: String,
      unique: true,
      required: true,
      length: 6,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    users: {
      type: [
        {
          user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          },
          role: {
            type: String,
            enum: ['admin', 'member'],
            default: 'member',
          },
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

groupSchema.virtual('userCount').get(function () {
  return this.users?.length || 0;
});

groupSchema.pre<Query<any, IGroup>>(/^find/, function (next) {
  this.find({ active: true });
  next();
});

export const Group =
  (models.Group as Model<IGroup>) || model<IGroup>('Group', groupSchema);
