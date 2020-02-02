import { Document } from 'mongoose';

export interface IDonation extends Document {
  readonly donorUserId: string;
  readonly ipLocation: string;
  readonly amount: number;
  readonly currency: string;
  readonly exchangeRate: number;
  readonly nairaAmount: number;
  readonly projectId: string;
}