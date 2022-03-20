const express = require("express");
const router = express.Router();
const { check, validationResult} = require("express-validator");
const User = require("../../models/User");
const gravatar = require("gravatar");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");

// @route       POST api/users
// @description Register User
// @access      Public

router.post("/", [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Email be valid email").isEmail(),
    check("password", "Password be at least six characters").isLength({ min:6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const { name, email, password } = req.body;

    try {
        // console.log(`Req's email: ${email}`)
        // See if user exists
        let user = await User.findOne({ email })

        //if user exists, throw 400
        // console.log(user.email)
        if (user) {
            return res.status(400).json({ errors: [{msg: "User already exists."}]});
        }

        // Get user's gravatar
        const avatar = gravatar.url(email, {
            s: "200", //size
            r: "pg", //rating, parental guidance
            d: "mm", //default image
        });

        user = new User({
            name, 
            email, 
            avatar, 
            password,
        });

        // Encrypt Password
        const salt = await bcrypt.genSalt(10); //Ten salt rounds
        user.password = await bcrypt.hash(password, salt);

        //save user
        await user.save();
        // res.send("User saved to database.");

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