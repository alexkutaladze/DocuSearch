import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { UserModel } from "./types/User";
import { compare, hash } from "bcryptjs";
import bodyParser from "body-parser";
import { createAccessToken } from "./functions/jwt";
import { JwtPayload, verify } from "jsonwebtoken";
dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const port = 8080; // default port to listen

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
	console.log("Connected to database");
});

// define a route handler for the default home page
app.get("/", async (req, res) => {
	res.send("Hello");
});

app.post("/register", async (req, res) => {
	const body = req.body;

	const userExists = await UserModel.findOne({ username: body.username });
	const emailExists = await UserModel.findOne({ email: body.email });

	if (!userExists && !emailExists) {
		const password = await hash(body.password, 12);
		const doc = new UserModel({
			username: body.username,
			email: body.email,
			password,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		await doc
			.save()
			.then(val => res.json({ ok: true, data: val }))
			.catch(e => res.json({ ok: false, data: e }));
	} else {
		res.json({ ok: false, data: "Account with supplied username or e-mail already exists" });
	}
});

app.post("/login", async (req, res) => {
	const body = req.body;

	const findUser = await UserModel.findOne({ username: body.username });
	if (!findUser) return res.json({ ok: false, data: "Specified user does not exist" });

	const passwordValidation = await compare(body.password, findUser.password);
	if (!passwordValidation) return res.json({ ok: false, data: "Incorrect password" });

	return res.json({ ok: true, accessToken: createAccessToken(findUser), data: findUser });
});

app.post("/auth", async (req, res) => {
	const headers = req.headers.authorization;
	const token = headers.split(" ")[1];

	try {
		const payload = verify(token, process.env.ACCESS_TOKEN_SECRET);
		const findUser = await UserModel.findOne({ username: (payload as any).username });

		res.send({ ok: true, user: findUser });
	} catch (error) {
		console.log(error);
		res.json({ ok: false });
	}
});

// start the Express server
app.listen(port, () => {
	// tslint:disable-next-line:no-console
	console.log(`server started at http://localhost:${port}`);
});
