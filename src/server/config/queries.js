import { getters } from '../caching/getters.js';
import db from './db.js';

const getPosts = async (props) => {
	let posts = [];
	const dateFormat = "TO_CHAR(t_post.date, 'DD/MM/YYYY') AS date";

	if (props.filter === 'all') {
		posts = (await db.query(`
			SELECT
				t_post.id,
				t_post.title,
				t_post.description,
				${dateFormat},
				t_userA.username,
				(
					SELECT ARRAY_AGG(tag) AS tags
					FROM t_tagpost
					JOIN t_tag ON t_tag.id = t_tagpost.id_tag
					WHERE t_tagpost.id_post = t_post.id
				) AS tags,
				'not joined' AS status
			FROM
				t_post
			LEFT JOIN
				t_user AS t_userA ON t_userA.id = t_post.id_user
			WHERE
				t_userA.username != $1
				AND NOT EXISTS (
					SELECT
						t_member.id_post
					FROM
						t_member
					LEFT JOIN
						t_user AS t_userB ON t_userB.id = t_member.id_user
					WHERE
						t_userB.username = $1
						AND t_post.id = t_member.id_post
						AND (t_member.membership = 1 OR t_member.membership = 2)
				)
		`, [props.username])).rows;
	}

	if (props.filter === 'joined') {
		if (props.username !== props.you.username) {
			posts = (await db.query(`
				SELECT
					t_post.id,
					admin.username AS username,
					t_post.title,
					t_post.description,
					${dateFormat},
					(
						SELECT ARRAY_AGG(tag) AS tags
						FROM t_tagpost
						JOIN t_tag ON t_tag.id = t_tagpost.id_tag
						WHERE t_tagpost.id_post = t_post.id
					) AS tags,
					(CASE 
						WHEN viewer.membership = 1 THEN 'joined'
						WHEN viewer.membership = 0 THEN 'not joined'
						WHEN viewer.membership = 2 THEN 'banned'
						WHEN viewer.membership IS NULL AND (admin.id = $1) THEN 'joined'
						ELSE 'not joined'
					END) AS status
				FROM
					t_member
				INNER JOIN
					t_post ON t_post.id = t_member.id_post
				INNER JOIN
					t_user AS admin ON admin.id = t_post.id_user
				INNER JOIN
					t_user ON t_user.id = t_member.id_user
				LEFT JOIN
					t_member AS viewer ON viewer.id_user = $1 AND viewer.id_post = t_member.id_post
				WHERE
					t_user.username = $2
					AND t_user.username != $3
					AND (t_member.membership = 1 OR t_member.membership = 2) 
			`, [props.you.id, props.username, props.you.username])).rows;
		} else {
			posts = (await db.query(`
				SELECT
					t_post.id,
					admin.username AS username,
					t_post.title,
					t_post.description,
					${dateFormat},
					(
						SELECT ARRAY_AGG(tag) AS tags
						FROM t_tagpost
						JOIN t_tag ON t_tag.id = t_tagpost.id_tag
						WHERE t_tagpost.id_post = t_post.id
					) AS tags,
					(CASE 
						WHEN t_member.membership = 1 THEN 'joined'
						ELSE 'banned'
					END) AS status
				FROM
					t_member
				INNER JOIN
					t_post ON t_post.id = t_member.id_post
				INNER JOIN
					t_user ON t_user.id = t_member.id_user
				INNER JOIN
					t_user AS admin ON admin.id = t_post.id_user
				WHERE
					t_user.username = $1
					AND t_member.membership != 0
			`, [props.username])).rows;
		}
	}

	if (props.filter === 'user') {
		if (props.username !== props.you.username) {
			posts = (await db.query(`
				SELECT
					t_post.id,
					admin.username AS username,
					t_post.title,
					t_post.description,
					${dateFormat},
					(
						SELECT ARRAY_AGG(tag) AS tags
						FROM t_tagpost
						JOIN t_tag ON t_tag.id = t_tagpost.id_tag
						WHERE t_tagpost.id_post = t_post.id
					) AS tags,
					(CASE
						WHEN t_member.id_user IS NOT NULL THEN
							(CASE
								WHEN t_member.membership = 0 THEN 'not joined'
								WHEN t_member.membership = 2 THEN 'banned'
								ELSE 'joined'
							END)
						ELSE 'not joined'
					END) AS status
				FROM
					t_post
				INNER JOIN t_user AS admin ON admin.id = t_post.id_user
				LEFT JOIN t_member ON t_post.id = t_member.id_post AND t_member.id_user = $1
				WHERE
					admin.username = $2
			`, [props.you.id, props.username])).rows;
		} else {
			posts = (await db.query(`
				SELECT
					t_post.id,
					t_post.title,
					t_post.description,
					${dateFormat},
					$2 AS username,
					'owner' AS status,
					(
						SELECT ARRAY_AGG(tag) AS tags
						FROM t_tagpost
						JOIN t_tag ON t_tag.id = t_tagpost.id_tag
						WHERE t_tagpost.id_post = t_post.id
					) AS tags
				FROM
					t_post
				WHERE
					t_post.id_user = $1
			`, [props.you.id, props.you.username])).rows;
		}
	}

	const redundant = new Map();
	for (let index = 0; index < posts.length; index++) {
		const post = posts[index];
		let image = redundant.get(post.username);
		if (image === undefined) {
			image = await getters.get_user_profile_image(post.username);
			redundant.set(post.username, image);
		}
		posts[index] = ({ ...post, image });
	}

	return posts;
};

export default getPosts;
