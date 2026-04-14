import { Router } from "express";
import { validate } from "../../utils/validate.js";
import { bookSeatSchema } from "./models.js";
import { BookingController } from "./controller.js";
import { authenticateToken } from "../middleware/middleware.js";

const bookRouter = Router();
const bookingController = new BookingController();


// Public route to get all seats
bookRouter.get("/seats", bookingController.handleGetSeats.bind(bookingController));

// Protected route to book (requires cookie token)
bookRouter.put("/:id/:name", validate(bookSeatSchema), authenticateToken, bookingController.handleBookingSeat.bind(bookingController));

export default bookRouter;