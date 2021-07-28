import { sign } from "jsonwebtoken";
import { IUser } from "../types/User";
import mongoose from "mongoose";

export const createAccessToken = (user: IUser & mongoose.Document<any, any, IUser>) => {
	const payload = sign({ username: user.username }, process.env.ACCESS_TOKEN_SECRET);
	return payload;
};
