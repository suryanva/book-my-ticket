import { Request, Response, NextFunction } from 'express';
import type { ZodObject } from 'zod';

export const validate = (schema: ZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("--- Validation Start ---"); // Proof of life
    try {
      const result = await schema.safeParseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (!result.success) {
        console.log("Validation failed logic triggered");
        return res.status(400).json({
          status: 'failed',
          message: 'Validation Error',
          errors: result.error.issues,
        });
      }


      if (result.data.body) {
        req.body = result.data.body;
      }


      return next();
    } catch (error: any) {
      console.error("CATCH BLOCK TRIGGERED:", error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal Server Error',
        error_details: error.message
      });
    }
  };