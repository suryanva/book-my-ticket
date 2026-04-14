import express from "express";
import type { Router } from "express";
import { validate } from "../../utils/validate.js";
import AuthicationController from "./controller.js";
import { signUpPayloadModel, signInPayloadModel } from "./models.js";


export const authRouter: Router = express.Router();

const auth = new AuthicationController();

authRouter.post('/sign-up', validate(signUpPayloadModel), auth.handleSignUp.bind(auth));
authRouter.post('/sign-in', validate(signInPayloadModel), auth.handleSignIn.bind(auth));
