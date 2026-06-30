/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import cors from 'cors';
import proxy from 'express-http-proxy';
import morgan from 'morgan';
import * as path from 'path';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: [
    'Content-Type',
    'Authorization'
  ]
}));
app.use(morgan('dev'))
app.use(express.json({limit:'100mb'}))
app.use(express.urlencoded({limit: '100mb', extended:true}));
app.use(cookieParser())
app.set('trust proxy', 1)


//apply api rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req:any) => (req.user ? 1000 : 100),
  message: {error: 'Too many requests from this IP, please try again later'},
  standardHeaders: true,
  legacyHeaders: true,

})

app.use(limiter);
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});
app.use("/", proxy("http://127.0.0.1:6001"))
const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
