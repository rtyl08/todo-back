import express from "express"
import cors from "cors";
import 'express-async-errors';
import cookieParser from 'cookie-parser';
import cookieSession from "cookie-session";
import {handleError} from "./utils/errors";
import rateLimit from "express-rate-limit";
import {todoRouter} from "./routers/todo";
import {ownerRouter} from "./routers/owner";

const app = express();
const limiter = rateLimit({
    windowMs:15*60*1000,
    max:100,
    standardHeaders:true,
    legacyHeaders:false,
})
app.use(limiter);
app.use(cors({
    origin: 'http://localhost:3000',
}));

app.use(cookieParser());

app.use(cookieSession({
    name: 'session',
    keys: ['config.keySession'],
    secret:'config.secret',
}));
app.use(express.json());

app.use('/tasks', todoRouter);
app.use('/owner', ownerRouter);

app.use(handleError);

app.listen(3001, '0.0.0.0', () => {
    console.log('Listening on port http://localhost:3001')
});

