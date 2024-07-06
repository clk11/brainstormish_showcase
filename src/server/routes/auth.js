import bcrypt from 'bcryptjs';
import express from 'express';
import jwt from 'jsonwebtoken';
import config from 'config';
import { check, validationResult } from 'express-validator';
import auth from '../middlewares/auth.js';
import db from '../config/db.js';
import dotenv from 'dotenv'
import multer from 'multer'
import { cache_functions, cache_middlewares } from '../caching/caching.js';
import { savePic, retrievePic } from '../config/s3.js';
const { getters, setters } = cache_functions;
const { cache_user_profile } = cache_middlewares
const { get_mail_id } = getters;
const { set_user_profile } = setters;
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const router = express.Router();
dotenv.config();
// @route => /auth
// @desc => Get the user
// @access => Private
router.get('/', auth, cache_user_profile, async (req, res) => {
	try {
		const { username } = req.user;
		const user = (await db.query(
			`select id,username,email,to_char(date, 'DD/MM/YYYY at HH24:MI') AS date from t_user where username=$1`,
			[username]
		)).rows[0];
		const image = await retrievePic(username, true);
		const userInfo = { ...user, image };
		await set_user_profile(userInfo);
		res.json(userInfo);
	} catch (err) {
		res.status(401).send({ msg: 'Permission denied !' });
	}
});

// @route => /auth
// @desc => Log the user
// @access => Public

router.post(
	'/',
	[
		check('username')
			.not()
			.isEmpty()
			.withMessage("Username shouldn't be empty !"),
		check('password')
			.not()
			.isEmpty()
			.withMessage("Password shouldn't be empty !"),
	],
	async (req, res) => {
		const err = validationResult(req);
		if (!err.isEmpty()) return res.status(400).send({ err: err.array().map(x => x.msg) });
		try {
			const { username, password } = req.body;
			const record = await db.query(`select * from t_User where username=$1;`, [
				username,
			]);
			const user = record.rows[0];
			if (user) {
				const isMatch = await bcrypt.compare(password, user.password);
				if (!isMatch)
					return res.status(400).send({ err: 'Invalid credentials .' });
			} else return res.status(400).send({ err: 'Invalid credentials .' });
			let payload = {
				user: {
					username,
					id: user.id,
				},
			};
			const expir = 3600; // 3600ms -> 1hr
			const token = jwt.sign(payload, config.get('jwtSecret'), {
				expiresIn: expir + 's',
			});
			res.cookie('token', token, {
				httpOnly: true,
				secure: process.env.PRODUCTION === 'yes' ? true : false,
				maxAge: expir * 1000,
			});
			res.json({ status: 1 });
		} catch (err) {
			res.status(500).send({ err: 'Server error !' });
		}
	}
);

// @route => /auth/validate_credentials
// @desc => Validate the credentials
// @access => Public

router.post(
	'/validate_credentials',
	[
		check('username')
			.not()
			.isEmpty()
			.withMessage("Username shouldn't be empty!")
			.custom(value => {
				if (value.includes(' ')) {
					throw new Error("Username shouldn't contain spaces!");
				}
				return true;
			})
			.custom(value => {
				const words = value.split(' ');
				return words.length === 1;
			})
			.withMessage("Username should be a single word !"),

		check('password')
			.isLength({ min: 6, max: 15 })
			.withMessage('You should add a password between 6 and 15 characters!')
			.custom(value => {
				if (value.includes(' ')) {
					throw new Error("Password shouldn't contain spaces!");
				}
				return true;
			}),

		check('email')
			.isEmail()
			.withMessage('You need to enter a valid email!')
			.custom(value => {
				if (value.includes(' ')) {
					throw new Error("Email shouldn't contain spaces!");
				}
				return true;
			}),

		check('rpassword')
			.custom((value, { req }) => {
				if (value !== req.body.password) {
					throw new Error('Your passwords do not match.');
				}
				if (value.includes(' ')) {
					throw new Error("Repeated password shouldn't contain spaces!");
				}
				return true;
			}),
	],
	async (req, res) => {
		let err = validationResult(req);
		if (err.isEmpty()) {
			const { username, email } = req.body;;
			try {
				err = [];
				let record = await db.query(
					`select * from t_user where username=$1;`,
					[username]
				);
				const check_username = record.rows[0];
				record = await db.query(
					`select * from t_user where email=$1;`,
					[email]
				);
				const check_email = record.rows[0];
				if (check_username !== undefined) err.push('Username already in use !')
				if (check_email !== undefined) err.push('Email already in use !')
				if (check_username !== undefined || check_email !== undefined)
					return res.status(500).send({ err });
				res.json({ status: 1 });
			} catch (err) {
				res.status(500).send({ err: 'Server error .' });
			}
		} else
			res.status(500).send({ err: err.array().map(x => x.msg) });
	}
);

// @route => /auth/validate_email
// @desc => Validate the email
// @access => Private

router.post('/validate_email', [check('email').isEmail().withMessage('You need to enter a valid email !')], async (req, res) => {
	try {
		let err = validationResult(req);
		if (err.isEmpty()) {
			const { email } = req.body
			const result = (await db.query(`select id from t_user where email = $1;`, [email])).rows[0];
			if (result)
				res.json({ status: 1 });
			else
				res.status(400).send({ err: 'There is no user with the provided email' });
		} else
			res.status(400).send({ err: err.array().map(x => x.msg) });
	} catch (error) {
		res.status(500).send({ err: 'Server error .' });
	}
})

// @route => /auth/register
// @desc => Add a new user
// @access => Private

router.post('/reset_password', [check('new_password').isLength({ min: 6, max: 15 }).withMessage('You should add a password between 6 and 15 chars !')], async (req, res) => {
	try {
		let err = validationResult(req);
		if (err.isEmpty()) {
			const { new_password, email, userid } = req.body;
			const valid = await get_mail_id(userid);
			if (valid === 'granted') {
				const salt = await bcrypt.genSalt(10);
				const safePassword = await bcrypt.hash(new_password, salt);
				await db.query(
					`update t_user set password = $1 where email = $2;`,
					[safePassword, email]
				);
				res.json({ status: 1 });
			} else res.status(400).send({ err: 'Not granted .' });
		} else
			res.status(400).send({ err: err.array().map(x => x.msg) });
	} catch (error) {
		res.status(500).send({ err: 'Server error .' });
	}
});


// @route => /auth/register
// @desc => Add a new user
// @access => Private

router.post('/register', async (req, res) => {
	try {
		const { user, userid } = req.body;
		const valid = await get_mail_id(userid);
		if (valid === 'granted') {
			const { username, password, email } = user;
			const salt = await bcrypt.genSalt(10);
			const safePassword = await bcrypt.hash(password, salt);
			await db.query(
				`insert into t_user (username,password,email)values($1,$2,$3);`,
				[username, safePassword, email]
			);
			res.json({ status: 1 });
		} else res.status(400).send({ err: 'Not granted .' });
	} catch (error) {
		res.status(500).send({ err: 'Server error .' });
	}
});

// @route => /session
// @desc => Check the token
// @access => Private

router.get('/session', auth, (_, res) => {
	res.sendStatus(200);
});


// @route => /clear_session
// @desc => logout
// @access => Private

router.get('/clear_session', auth, (_, res) => {
	res.clearCookie('token');
	res.sendStatus(200);
});

// @route => /change_profile_pic
// @desc => Change the profile picture for the user
// @access => Private

router.post('/change_profile_pic', auth, upload.single('image'), async (req, res) => {
	try {
		const file = req.file
		const uploadParams = {
			Body: file.buffer,
			Key: `profile_images/${req.user.username}`,
			ContentType: file.mimetype
		}
		await savePic(uploadParams);
		res.sendStatus(200);
	} catch (error) {
		res.status(500).send({ err: 'Server error .' });
	}
})

export default router;