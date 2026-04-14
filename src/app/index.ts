import express from 'express'
import type { Express } from 'express'
import { join } from "path";
import pool from '../db/index.js';
import cookieParser from 'cookie-parser';
import bookRouter from './booking/routes.js';
import { authRouter } from './auth/routes.js';

export function createApplication(): Express {

  const rootPath = process.cwd();


  const app = express();
  app.use(express.json())
  app.use(cookieParser())


  app.get("/", (req, res) => {
    res.sendFile(join(rootPath + "/index.html"));
  });


  app.use("/api/v1/user", authRouter);
  app.use("/api/v1/booking", bookRouter)




  return app;
}



pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.stack);
  } else {
    console.log('✅ Database connected at:', res.rows[0].now);
  }
});