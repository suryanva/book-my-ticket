import { Request, Response } from "express";
import pool from "../../db/index.js";
import { AuthRequest } from "../middleware/middleware.js";
export class BookingController {
    public async handleGetSeats(req: Request, res: Response): Promise<void> {
        try {
            const result = await pool.query("select * from seats");
            res.status(200).json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    public async handleBookingSeat(req: AuthRequest, res: Response): Promise<void> {
        const client = await pool.connect();
        try {
            const seatId = req.params.id;
            const nameFromUrl = req.params.name;
            const userIdFromToken = req.user!.userId;

            // 1. DATABASE CROSS-CHECK
            // We check if the userId from the token matches the full_name in the DB
            const userCheckSql = "SELECT id FROM users WHERE id = $1 AND full_name = $2";
            const userResult = await client.query(userCheckSql, [userIdFromToken, nameFromUrl]);

            if (userResult.rowCount === 0) {
                // This means the logged-in user is NOT who they claim to be in the URL
                res.status(403).json({
                    status: "failed",
                    message: "Identity mismatch. You cannot book for this name."
                });
                return;
            }


            await client.query("BEGIN");

            // Check if seat is available
            const checkSql = "SELECT * FROM seats WHERE id = $1 AND isbooked = 0 FOR UPDATE";
            const result = await client.query(checkSql, [seatId]);

            if (result.rowCount === 0) {
                await client.query("ROLLBACK");
                res.status(400).json({ error: "Seat already booked or not found" });
                return;
            }

            // Update the seat with the name provided in the URL
            const updateSql = "UPDATE seats SET isbooked = 1, name = $2 WHERE id = $1";
            await client.query(updateSql, [seatId, nameFromUrl]);


            await client.query("COMMIT");
            res.status(200).json({ message: `Seat ${seatId} successfully booked for ${nameFromUrl}` });

        } catch (error) {
            await client.query("ROLLBACK");
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        } finally {
            client.release();
        }
    }
}