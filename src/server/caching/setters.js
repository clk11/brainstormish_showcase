import client from './redisClient.js';
import { getters } from './getters.js';
import { v4 as uuidv4 } from 'uuid';
const { get_date, get_room } = getters;

async function create_connection(username, postid, socketid) {
    if (!(await get_room(postid)))
        await client.sadd('posts', postid);
    // ------------------------------------------------- !
    await client.zadd(`post-room:${postid}:users`, 1, username);
    await client.hmset(`member:${socketid}`, 'user', username, 'room', postid);
}

async function refresh_connection(username, postid, socketid) {
    const exists_user = await client.zscore(`post-room:${postid}:users`, username);
    if (exists_user !== null && exists_user != -1) {
        if (exists_user === 0) {
            await client.zadd(`post-room:${postid}:users`, 1, username);
            await client.hmset(`member:${socketid}`, 'user', username, 'room', postid);
        }
    } else
        return 1;
    return 0;
}

async function disconnect_user(socketid) {
    const get_user = await client.hgetall(`member:${socketid}`);
    if (get_user !== null) {
        const { user, room } = get_user;
        const user_status = await client.zscore(`post-room:${room}:users`, user);
        if (user_status !== null && user_status != -1) {
            await client.zadd(`post-room:${room}:users`, 0, user);
            await client.del(`member:${socketid}`);
        }
    }
}

async function add_message(username, postid, message, imageId, unique) {
    const exists_user = await client.zscore(`post-room:${postid}:users`, username);
    if (exists_user !== null) {
        const date = await get_date();
        await client.hmset(unique,
            'user', username,
            'message', message,
            'date', date,
            'imageId', imageId
        )
        await client.rpush(`post-room:${postid}:messages`, unique);
        await client.incr('message-id');
    }
}

async function set_mail_id(userid, id) {
    await client.setex(userid, 300, id);
}

async function update_user_status(username, room, socketid, status) {
    await client.del(`member:${socketid}`);
    if (status == 0) {
        await client.zrem(`post-room:${room}:users`, username);
    }
    else {
        await client.zadd(`post-room:${room}:users`, (status == 1 ? 0 : -1), username);
    }
}


async function purge() {
    await client.flushall();
}

async function feed_messages(messages, postid) {
    for (let i = 0; i < messages.length; i++) {
        const messageInfo = messages[i];
        const { username, message, imageid } = messageInfo;
        const postMessageKey = uuidv4();
        await client.hmset(postMessageKey,
            'user', username,
            'message', message,
            'imageId', imageid
        )
        await client.rpush(`post-room:${postid}:messages`, postMessageKey);
    }
}

async function feed_members(members, postid) {
    for (let i = 0; i < members.length; i++) {
        const username = members[i].username;
        const membership = members[i].membership == 1 ? 0 : -1;
        if (!(await get_room(postid)))
            await client.sadd('posts', postid);
        await client.zadd(`post-room:${postid}:users`, membership, username);
    }
}

async function set_user_profile(user) {
    const { username, date, image } = user;
    await client.hmset(`profile:${username}`,
        'username', username,
        'date', date,
        'image', image,
        'email', user.email === undefined ? 'private' : user.email
    );
    await client.expire(`profile:${username}`, 3600);
}

export const setters = {
    add_message,
    disconnect_user,
    create_connection,
    refresh_connection,
    set_mail_id,
    update_user_status,
    purge,
    feed_messages,
    feed_members,
    set_user_profile,
}