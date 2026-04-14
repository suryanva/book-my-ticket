import type { Request, Response } from "express"
import { query } from "../../db/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";



class AuthicationController {

    public async handleSignUp(req: Request, res: Response) {

        try {

            const { email, password, full_name } = req.body;

            const hashedPassword = await bcrypt.hash(password, 10);

            const result = await query('INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING id,full_name,email', [full_name, email, hashedPassword]);

            const newUser = result.rows[0];

            res.status(201).json({
                success: true,
                message: "User Registered SuccessFully",
                data: newUser
            })
        } catch (err: any) {
            console.error("SIGNUP DB ERROR:", err);

            if (err.code === '23505') {
                return res.status(400).json({ error: "Email already exists" });
            }
          
            res.status(500).json({ error: "Internal Server Error", detail: err.message })


        }


    }

    public async handleSignIn(req: Request, res: Response) {


        try {
            const { email, password } = req.body;

            const result = await query("SELECT * FROM users WHERE email = $1", [email]);
            if (result.rowCount === 0) return res.status(401).json({ error: "Invalid credentials" });

            const user = result.rows[0];
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            if (!isPasswordValid) return res.status(401).json({ error: "Invalid credentials" });

            // Generate Tokens
            const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "15m" });
            const refreshToken = jwt.sign({ userId: user.id }, process.env.REFRESH_SECRET!, { expiresIn: "7d" });

            // Save Refresh Token to DB
            await query("UPDATE users SET refresh_token = $1 WHERE id = $2", [refreshToken, user.id]);

            // Cookie Options
            const cookieOptions: any = {
                httpOnly: true,    // Prevents JS access (Shield against XSS)
                secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
                sameSite: "strict", // Shield against CSRF
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
            };

            // Set Cookies and Send Response
            res
                .cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 }) // 15 mins
                .cookie("refreshToken", refreshToken, cookieOptions)
                .status(200)
                .json({
                    message: "Logged in successfully",
                    user: { id: user.id, full_name: user.full_name, email: user.email }
                });

        } catch (err) {
            res.status(400).json({ error: "Login failed" });
        }


    }

}


export default AuthicationController