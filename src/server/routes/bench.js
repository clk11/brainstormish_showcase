import express from 'express'
import auth from '../middlewares/auth.js';
import multer from 'multer'
import db from '../config/db.js';
import { cache_middlewares, cache_functions } from '../caching/caching.js'
import { v4 as uuidv4 } from 'uuid';
import { savePic } from '../config/s3.js';
//
const { cache_post_data } = cache_middlewares
const { setters } = cache_functions;
const { feed_members, feed_messages } = setters;
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

//
const router = express.Router();

// @route => /bench/membership
// @desc => Check to see if the user is eligible to join the post
// @access => Private

router.get('/membership', auth, async (req, res) => {
    try {
        const { room } = req.query;
        const admin = (await db.query(`select title,description from t_post where id_user = $1 and id = $2`, [req.user.id, room])).rows[0];
        if (admin === undefined) {
            const record = (await db.query(`
            select t_post.title,t_post.description,t_member.membership,t_user.username as username from t_member
            join t_post on t_member.id_post = t_post.id
            join t_user on t_user.id = t_post.id_user
            where t_member.id_user = $1 and t_member.id_post = $2
            `, [req.user.id, room])).rows[0];
            if (record === undefined)
                res.status(400).send({ err: "You haven't joined this post !" })
            else {
                if (record.membership === 1)
                    res.json({ title: record.title, description: record.description, username: req.user.username, admin: record.username })
                else if (record.membership === 0)
                    res.status(400).send({ err: "You haven't joined this post !" })
                else res.status(400).send({ err: 'You are banned !' });
            }
        } else
            res.json({ title: admin.title, description: admin.description, username: req.user.username, admin: req.user.username });
    } catch (error) {
        res.status(500).send({ err: 'Server error .' });
    }
})


// @route => /bench/manageMembership
// @desc => Change the membership of a user
// @access => Private

router.put('/manageMembership', auth, async (req, res) => {
    try {
        const { username, room, action } = req.query;
        let type, id;
        if (username === undefined) {
            type = 0
            id = req.user.id
        }
        else {
            if (action === "ban")
                type = 2
            else
                type = 1
            id = (await db.query(`select id from t_user where username = $1`, [username])).rows[0].id;
        }
        await db.query(`UPDATE t_member
                  set membership = $1
                  where id_post = $2
                  and id_user = $3
    `, [type, room, id])
        res.sendStatus(200);
    } catch (error) {
        res.status(500).send({ err: 'Server error .' });
    }
});


// @route => /bench/retrieve
// @desc => Get conversation data
// @access => Private

router.get('/retrieve', auth, cache_post_data, async (req, res) => {
    try {
        const { room } = req.query;
        const admin = (await db.query(`select t_user.username as username from t_post 
        inner join t_user on t_user.id = t_post.id_user
        where t_post.id = $1;`, [room])).rows[0].username;
        let members = (await db.query(`select t_user.username, membership from t_member
        inner join t_user on t_user.id = t_member.id_user
        WHERE (membership = 1 or membership = 2) and id_post = $1`, [room])).rows;
        members.push({ username: admin });
        const messages = (await db.query(`select t_user.username,message,imageId from t_message
        inner join t_user on t_user.id = t_message.id_user
        where id_post = $1`, [room])).rows;
        if (members && messages) {
            await feed_members(members, room);
            await feed_messages(messages, room);
        } else
            res.status(400).send({ err: "Something went wrong with the data retrieval!" })
        res.sendStatus(200);
    } catch (error) {
        res.status(500).send({ err: 'Server error .' });
    }
});


router.post('/upload_chat_image', auth, upload.single('image'), async (req, res) => {
    try {
        const file = req.file
        const imageId = uuidv4();
        const uploadParams = {
            Body: file.buffer,
            Key: `chatting_images/${imageId}`,
            ContentType: file.mimetype
        }
        await savePic(uploadParams);
        res.json(imageId);
    } catch (error) {
        console.log(error);
        res.status(500).send({ err: 'Server error .' });
    }
})

export default router;