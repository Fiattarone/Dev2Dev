const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function(req, res, next) {
    //get token from header
    const token = req.header("x-auth-token");

    //check if not a token
    if (!token) {
        return res.status(401).json({ message: "Missing token, denied authorization."});
    }

    //verify token if there is one
    try {
        const decoded = jwt.verify(token, config.get("jsonSecret"));
        req.user = decoded.user;
        next();
    } catch(err) {
        res.status(401).json({ message: "Invalid token." });
    }
};