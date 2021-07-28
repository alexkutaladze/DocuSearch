import { Schema, model, connect } from "mongoose";

export interface IUser {
	username: string;
	email: string;
	password: string;
	createdAt: Date;
	updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
	username: { type: String, required: true },
	email: { type: String, required: true },
	password: { type: String, required: true },
	createdAt: { type: Date, required: true },
	updatedAt: { type: Date, required: true },
});

export const UserModel = model<IUser>("User", UserSchema);
