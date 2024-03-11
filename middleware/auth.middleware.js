const jwt = require('jsonwebtoken');
const { jwtKey } = require('../config/env')

module.exports = (req, res, next) => {
    const token = req.headers.token;
    if (!token)
        return res.status(401).json(['Authorizaton denied']);
    try {
        const decoded = jwt.verify(token, jwtKey);
        if (decoded) {
            next();
        } else {
            res.status(401).json(['Authorizaton denied']);
        }
    } catch (e) {
        res.status(401).json(['Authorizaton denied']);
    }
};