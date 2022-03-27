const express = require("express");
const request = require("request");
const config = require("config");

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

// @route       DELETE api/profile
// @description Delete profile, user and posts
// @access      Private

router.delete("/", auth, async (req, res) => {
    try {
        // @todo: remove user's posts

        // remove profile
        await Profile.findOneAndRemove({ user: req.user.id });
        // remove user
        await User.findOneAndRemove({ _id: req.user.id });

        res.json({ message: "User deleted." });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error.");
    }
});

// @route       PUT api/profile/experience
// @description Add profile experience
// @access      Private

router.put("/experience", 
[
    auth,
    [
        check("title", "Title is required.").not().isEmpty(),
        check("company", "Company is required.").not().isEmpty(),
        check("from", "From date is required.").not().isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        title, 
        company,
        location, 
        from,
        to, 
        current, 
        description
    } = req.body;

    const newExp = {
        title, 
        company,
        location, 
        from,
        to, 
        current, 
        description
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id });

        profile.experience.unshift(newExp);

        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error.")
    }
});

// @route       DELETE api/profile/experience/:exp_id
// @description Delete user experience from profile
// @access      Private

router.delete("/experience/:exp_id", auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        
        // Get index to remove 
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex, 1);

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error.");
    }
});

// @route       PUT api/profile/education
// @description Add profile education
// @access      Private

router.put("/education", 
[
    auth,
    [
        check("school", "School is required.").not().isEmpty(),
        check("degree", "Degree is required.").not().isEmpty(),
        check("fieldOfStudy", "Field of study is required.").not().isEmpty(),
        check("from", "From date is required.").not().isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        school, 
        degree,
        fieldOfStudy,
        location, 
        from,
        to, 
        current, 
        description
    } = req.body;

    const newEdu = {
        school, 
        degree,
        fieldOfStudy,
        location, 
        from,
        to, 
        current, 
        description
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id });

        profile.education.unshift(newEdu);

        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error.")
    }
});

// @route       DELETE api/profile/education/:exp_id
// @description Delete user education from profile
// @access      Private

router.delete("/education/:edu_id", auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        
        // Get index to remove 
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

        profile.education.splice(removeIndex, 1);

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error.");
    }
});

// @route       GET api/profile/github/:username
// @description Get user repos from github
// @access      Public

router.get("/github/:username", (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&
            sort=created:asc&client_id=${config.get("githubClientId")}&
            client_secret=${config.get("githubSecret")}`,
            method: "GET",
            headers: { "user-agent": "node.js" } 
        };

        request(options, (error, response, body) => {
            if (error) console.error(error);

            if (response.statusCode !== 200) {
                res.status(404).json({ message: "No Github Profile found." })
            }
            
            res.json(JSON.parse(body))
        })
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error.");
    }
})

module.exports = router;