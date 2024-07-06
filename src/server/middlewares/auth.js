import jwt from 'jsonwebtoken';
import config from 'config';

export default (req, res, next) => {
	const token = req.cookies.token;
	if (!token) {
		return res
			.status(401)
			.json({ err: 'Access denied , no token provided ...' });
	}
	try {
		const decoded = jwt.verify(token, config.get('jwtSecret'));
		req.user = decoded.user;
		next();
	} catch (err) {
		res.status(401).json({ err: 'Token is not valid ' });
	}
};
