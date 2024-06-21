import express from 'express';
import { check, validationResult } from 'express-validator'
import auth from '../middlewares/auth.js';
import db from '../config/db.js';
import getPosts from '../config/queries.js';
import { cache_functions, cache_middlewares } from '../caching/caching.js';
import { retrievePic } from '../config/s3.js';
const { setters } = cache_functions;
const { cache_user_profile } = cache_middlewares
const { set_user_profile } = setters;
const router = express.Router();
// @route => /wall
// @desc => Add a new post
// @access => Private
router.post(
	'/',
	[
		check('title')
			.isLength({ min: 2, max: 255 })
			.withMessage('The title should be between 2 chars and 255 !'),
		check('description')
			.isLength({ min: 20, max: 500 })
			.withMessage('The description should be between 20 chars and 500 !'),
		check('tags')
			.isArray({ min: 1 })
			.withMessage('You should add at least one tag !')
			.custom(tags => {
				const isInvalid = tags.some(tag => tag.length > 30);
				if (isInvalid) {
					throw new Error('Each tag should have a character count less than 30.');
				}
				return true;
			})
	],
	auth,
	async (req, res) => {
		const err = validationResult(req);
		if (err.isEmpty()) {
			try {
				const { description, title, tags } = req.body;
				const userid = (
					await db.query(`select id from t_user where username = $1;`, [
						req.user.username,
					])
				).rows[0].id;
				const postid = (
					await db.query(
						`insert into t_post(id_user,title,description)values($1,$2,$3) returning id;`,
						[userid, title, description]
					)
				).rows[0].id;
				tags.forEach(async (tag) => {
					const tag_row = (await db.query(`select id from t_tag where tag = $1`, [tag])).rows[0];
					let tagId = null;
					if (!tag_row) {
						tagId = (
							await db.query(`insert into t_tag(tag)values($1) RETURNING id;`, [
								tag,
							])
						).rows[0].id;
					} else tagId = tag_row.id;
					await db.query(
						`insert into t_tagPost(id_post,id_tag)values($1,$2);`,
						[postid, tagId]
					);
				});
				return res.status(200).send();
			} catch (err) {
				res.status(500).send({ err: 'Server error .' });
			}
		} else return res.status(500).send({ err: err.array().map(x => x.msg) });
	}
);

// @route => /wall
// @desc => Get the posts
// @access => Private

router.get('/', auth, async (req, res) => {
	try {
		const posts = await getPosts({ filter: 'all', username: req.user.username });
		res.json(posts);
	} catch (err) {
		res.status(400).send({ err: 'Something went wrong !' });
	}
});

// @route => /wall/:user/posts
// @desc => Get user's posts (created)
// @access => Private

router.get('/:user/posts', auth, async (req, res) => {
	try {
		const posts = await getPosts({ username: req.params.user, filter: 'user', you: req.user });
		res.json(posts);
	} catch (err) {
		res.status(400).send({ err: 'Something went wrong !' });
	}
});

// @route => /wall/:user/posts/joined
// @desc => Get user's joined posts
// @access => Private

router.get('/:user/posts/joined', auth, async (req, res) => {
	try {
		const posts = await getPosts({ username: req.params.user, filter: 'joined', you: req.user });
		res.json(posts);
	} catch (err) {
		res.status(400).send({ err: 'Something went wrong !' });
	}
});

// @route => /wall/profile/:user
// @desc => Get user's profile
// @access => Private

router.get('/profile/:user', auth, cache_user_profile, async (req, res) => {
	try {
		const user = (await db.query(
			`select username,to_char(date, 'DD/MM/YYYY at HH24:MI') AS date from t_user where username = $1`,
			[req.params.user]
		)).rows[0];
		const image = await retrievePic(req.params.user, true);
		const userInfo = { ...user, image };
		await set_user_profile(userInfo);
		res.json(userInfo);
	} catch (err) {
		res.status(400).send({ err: 'Something went wrong !' });
	}
});

// @route => /wall/join
// @desc => Join a discussion
// @access => Private

router.post('/join', auth, async (req, res) => {
	try {
		const { admin_username, id_post } = req.body;
		if (admin_username !== req.user.username) {
			const record = (await db.query(`select membership from t_member where id_user = $1 and id_post = $2`, [req.user.id, id_post])).rows[0];
			if (record === undefined)
				await db.query(`insert into t_member(id_user,id_post)values($1,$2)`, [req.user.id, id_post]);
			else if (record.membership === 1)
				return res.status(400).send({ err: "You've already joined the discussion !" });
			else if (record.membership === 0) {
				await db.query(`UPDATE t_member
				SET membership = 1
				WHERE id_user = $1 and id_post = $2
				`, [req.user.id, id_post]);
			}
			else return res.status(400).send({ err: "You were banned from the discussion !" });
		}
		else
			return res.status(400).send({ err: "You're the admin of the conversation, so you're already there !" });
		res.sendStatus(200);
	} catch (err) {
		res.status(400).send({ err: 'Something went wrong!' });
	}
});


export default router;
