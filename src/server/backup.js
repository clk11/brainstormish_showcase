import { cache_functions } from './caching/caching.js';
import db from './config/db.js';
const { getters, setters } = cache_functions;
const { get_messages } = getters;
const { purge } = setters;

(async function exec() {
    const data = await get_messages();

    const found_ids = new Map();
    for (let i = 0; i < data.length; i++) {
        for (let message_index = 0; message_index < data[i].messages.length; message_index++) {
            const message = data[i].messages[message_index];
            const room = data[i].room;
            let id_user = 0;
            const user_id = found_ids.get(message.username);
            if (user_id === undefined) {
                const userid = (await db.query(`select id from t_user where username = $1`, [message.username])).rows[0].id;
                found_ids.set(message.username, userid);
                id_user = userid;
            } else id_user = user_id;
            const dateParts = message.date.split(/[\/ :]/);
            const formattedDate = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')} 00:00:00`;
            await db.query(`
                INSERT INTO t_message (id_user, id_post, message, date, imageid)
                VALUES ($1, $2, $3, TO_TIMESTAMP($4, 'YYYY-MM-DD HH24:MI:SS') AT TIME ZONE 'UTC', $5);
            `, [id_user, room, message.text, formattedDate, message.imageId]);
        }
    }
    await purge();
    process.exit();
})();
