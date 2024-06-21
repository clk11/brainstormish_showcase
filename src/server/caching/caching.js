import { getters } from './getters.js';
import { setters } from './setters.js';

async function cache_post_data(req, res, next) {
    const { room } = req.query;
    if (await (getters.get_room(room)))
        res.sendStatus(200);
    else next();
}

async function cache_user_profile(req, res, next) {
    const username = req.params.user === null ? req.user.username : req.params.user;
    const user = await getters.get_user_profile(username);
    if (user !== null)
        res.send(user);
    else next();
}

export const cache_middlewares = {
    cache_post_data,
    cache_user_profile
};
export const cache_functions = {
    getters,
    setters
};