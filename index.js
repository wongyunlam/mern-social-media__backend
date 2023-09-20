import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import postRoutes from './routes/post.js';
import { register } from './controllers/auth.js';
import { createPost } from './controllers/post.js';
import { verifyToken } from './middleware/auth.js';
import User from './models/User.js';
import Post from './models/Post.js';
import { tempUsers, tempPosts } from './tempData/index.js';

/* CONFIGURATIONS */
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 配置CORS以允许特定域名的请求
const corsOptions = {
    origin: 'https://mern-social-media-frontend-murex.vercel.app/',
    optionsSuccessStatus: 200, // 一些浏览器需要此选项
};
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(morgan('common'));
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));
app.use(cors(corsOptions));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

/* FILE STORAGE */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/assets');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage });

/* ROUTES WITH FILES */
app.post('/auth/register', upload.single('picture'), register);
app.post('/posts', verifyToken, upload.single('picture'), createPost);

/* routes */
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/posts', postRoutes);

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 6001;
mongoose
    .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        app.listen(PORT, () => console.log(`Server Port: ${PORT}`));

        /* add temp data one time */
        // User.insertMany(tempUsers);
        // Post.insertMany(tempPosts);
    })
    .catch((error) => console.log(`${error} did not connect`));
