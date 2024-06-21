import { Server } from "socket.io";

import { v4 as uuidv4 } from 'uuid';

import { cache_functions } from '../caching/caching.js';

const { getters, setters } = cache_functions;

const { add_message, disconnect_user, create_connection, refresh_connection, update_user_status } = setters;

const { get_post_members, get_post_messages, get_message_image } = getters;

import dotenv from 'dotenv';
dotenv.config();

const initializeSocket = (server) => {

    const io = new Server(server, {
        cors: {
            origin: process.env.FN_URL,
            methods: ["GET", "POST"],
            credentials: true,
            allowHeaders: ["Content-Type", "Authorization"],
        }
    });

    io.on("connection", (socket) => {
        const heartbeatInterval = setInterval(() => {
            socket.emit('heart_beat');
        }, 1500);
        socket.on('disconnect', async () => {
            await disconnect_user(socket.id);
            clearInterval(heartbeatInterval);
        });
        socket.on('heart_beat_received', async (user) => {
            const { username, room } = user;
            const res = await refresh_connection(username, room, socket.id);
            if (res === 1)
                socket.emit('triggered_refresh');
        });
        socket.on("join_room", async (obj) => {
            const { username, room } = obj;
            await create_connection(username, room, socket.id);
            socket.join(room);
        });
        socket.on("send_message", async (obj) => {
            const unique = uuidv4();
            const { user, message, imageId } = obj;
            const { username, room } = user;
            await add_message(username, room, message, imageId, unique);
            socket.broadcast.to(room).emit("received_message", { ...obj, unique });
            socket.emit('received_unique', { ...obj, unique });
        });
        socket.on("get_users", async (room) => {
            const data = await get_post_members(room);
            socket.emit('getting_users', data);
        });
        socket.on("get_messages", async ({ room, right }) => {
            const messages = await get_post_messages(room, right);
            socket.emit("getting_messages", messages);
        });
        socket.on("update_user_status", async ({ username, room, status }) => {
            await update_user_status(username, room, socket.id, status);
        });
        socket.on('get_image', async (messageId) => {
            const image = await get_message_image(messageId);
            socket.emit('received_image', image);
        })
    })
}

export default initializeSocket;