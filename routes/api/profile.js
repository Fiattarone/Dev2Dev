const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const auth = require("../../middleware/auth");

const Profile = require("../../models/Profile");
const User = require("../../models/User");

// @route       GET api/profile/me
// @description Get current user's profile
// @access      Private

router.get("/me", auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate("user",
        ["name", "avatar"]);

        if (!profile) {
            return res.status(400).json({ message: "There is no profile for that user."});
        }

        res.json(profile);
     } catch(err) {
        console.error(err.message);
        res.status(500).send("Server Error.");
    }
});

// @route       GET (all) api/profile
// @description Get all profiles
// @access      Public

router.get("/", async (req, res) => {
    try {
        const profiles = await Profile.find().populate("user", 
        ["name", "avatar"]);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error.");
    }
});

// @route       GET api/profile/user/:user_id
// @description Get user profile by id
// @access      Public

router.get("/user/:user_id", async (req, res) => {
    try {
        const profiles = await Profile.findOne({ user: req.params.user_id }).populate("user", 
        ["name", "avatar"]);

        if (!profiles) return res.status(400).json({ message: "Profile not found." });

        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        if (err.kind == "ObjectId") {
            return res.status(400).json({ message: "Profile not found." });

        }
        res.status(500).send("Server Error.");
    }
});

// @route       POST api/profile
// @description Create or update user profile  
// @access      Private

router.post("/", 
[
    auth, 
    [
        check("status", "Status is required.").not().isEmpty(),
        check("skills", "At least one skill is required.").not().isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        company, 
        website, 
        location, 
        bio, 
        status, 
        ghusername,
        skills, 
        youtube, 
        facebook, 
        twitter, 
        instagram, 
        linkedin
    } = req.body;

    // Build profile object
    const profileField = {};
    // Grab user id
    profileField.user = req.user.id;
    if (company) profileField.company = company;
    if (website) profileField.website = website;
    if (location) profileField.location = location;
    if (bio) profileField.bio = bio;
    if (status) profileField.status = status;
    if (ghusername) profileField.ghusername = ghusername;
    if (skills) {
        profileField.skills = skills.split(",").map(skill => skill.trim());
    }
    console.log(profileField.skills);

    // Build Socials 
    profileField.social = {};
    if (youtube) profileField.social.youtube = youtube;
    if (facebook) profileField.social.facebook = facebook;
    if (twitter) profileField.social.twitter = twitter;
    if (instagram) profileField.social.instagram = instagram;
    if (linkedin) profileField.social.linkedin = linkedin;

    try {
        let profile = await Profile.findOne({ user: req.user.id });

        if (profile) {
            //Update
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileField },
                { new: true }
            );

            return res.json(profile)
        }

        // Create
        profile = new Profile(profileField);

        await profile.save();
        res.json(profile);
    } catch(err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
    // res.send("Yeetle");

})
module.exports = router;