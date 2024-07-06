import express from 'express';
import cors from 'cors';
import http from 'http'
import initializeSocket from './config/socket_init.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import wallRoutes from './routes/wall.js';
import benchRoutes from './routes/bench.js';
import mailRoutes from './routes/mail/mail.js'
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const server = http.createServer(app);

//Initializing the socket

initializeSocket(server);

//Enabling passing data to the body of the req

app.use(express.json({ extended: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use('/auth', authRoutes);
app.use('/wall', wallRoutes);
app.use('/bench', benchRoutes);
app.use('/mail', mailRoutes);
server.listen(3001, () => console.log(`Server started on port 3001`));
