import client from './redisClient.js'
import { retrievePic } from '../config/s3.js'

async function get_messages() {
    const all_rooms = await client.smembers('posts');
    const backup_data = [];
    for (let r = 0; r < all_rooms.length; r++) {
        const post_messages = await client.lrange(`post-room:${all_rooms[r]}:messages`, 0, -1);
        let messages = [];
        for (let i = 0; i < post_messages.length; i++) {
            const messageKey = post_messages[i];
            const messageInfo = await client.hgetall(messageKey);
            if (messageInfo.date)
                messages.push({ unique: messageKey, username: messageInfo.user, text: messageInfo.message, date: messageInfo.date, imageId: messageInfo.imageId });
        }
        backup_data.push({ room: all_rooms[r], messages });
    }
    return backup_data;
}

async function get_post_members(postid) {
    const post_users_raw = await client.zrange(`post-room:${postid}:users`, 0, -1, 'WITHSCORES');
    let post_users = [];
    for (let i = 0; i < post_users_raw.length; i += 2) {
        const username = post_users_raw[i];
        const status = post_users_raw[i + 1];
        post_users.push({ username, status });
    }
    return post_users;
}

async function get_post_messages(postid, right) {
    const decr = 6;
    const left = right - decr; // first right is -1 and then we go to the left
    const post_messages = await client.lrange(`post-room:${postid}:messages`, left, right);
    let messages = [];
    for (let i = 0; i < post_messages.length; i++) {
        const messageKey = post_messages[i];
        const messageInfo = await client.hgetall(messageKey);
        messages.push({ unique: messageKey, username: messageInfo.user, message: messageInfo.message, imageId: messageInfo.imageId });
    }
    return messages;
}


async function get_date() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();
    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
}


async function get_mail_id(userid) {
    return await client.get(userid);
}


async function get_room(room) {
    return await client.sismember('posts', room);
}

async function get_user_profile(username) {
    const user = await client.hgetall(`profile:${username}`);
    return user;
}

async function get_user_profile_image(username) {
    const image = await client.hget(`profile:${username}`, 'image');
    return image;
}

async function get_message_image(messageId) {
    const message = await client.hgetall(messageId);
    const imageLink = await client.get(`image:${messageId}`);
    if (imageLink === null) {
        const signedUrl = await retrievePic(message.imageId);
        await client.setex(`image:${messageId}`, 300, signedUrl);
        return signedUrl;
    }
    return imageLink;
}

export const getters = {
    get_post_members,
    get_post_messages,
    get_date,
    get_mail_id,
    get_messages,
    get_room,
    get_user_profile,
    get_user_profile_image,
    get_message_image
}