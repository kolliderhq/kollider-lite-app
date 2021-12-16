import { GENERAL } from 'consts/misc/general';

module.exports = (req, res) => {
	res.status(200).json({ version: GENERAL.FRONT_VER });
};
