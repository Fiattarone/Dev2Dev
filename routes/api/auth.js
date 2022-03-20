const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult} = require("express-validator");
const bcrypt = require("bcrypt");

const auth = require("../../middleware/auth");

const User = require("../../models/User");

// @route       GET api/auth
// @description Test route
// @access      Public

router.get("/", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password"); 
        // -password brings back everything minus the password
        res.json(user);
    } catch(err) {
        console.log(err.message);
        res.status(500).send("Server Error");
    }
});

// @route       POST api/auth
// @description Authenticate User & Get Token
// @access      Public


router.post("/", [
    check("email", "Email be valid email").isEmail(),
    check("password", "Password is required").exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const { email, password } = req.body;

    try {
        // See if user exists, otherwise, send back an error
        let user = await User.findOne({ email })

        //if user doesn't exist, throw 400
        if (!user) {
            return res.status(400).json({ errors: [{msg: "Invalid credentials."}]});
        }

        // Make sure password matches
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ errors: [{msg: "Invalid credentials."}]});
        }

        // Return JSON web Token (JWT)
        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(
            payload,
            config.get("jsonSecret"),
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                console.log(token);
                res.json({ token });
            });

    } catch(err) {
        console.log(err.message);
        res.status(500).send("Server error.")
    }

});

module.exports = router;