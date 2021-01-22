const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

const User = require("../models/User");
const Offer = require("../models/Offers");

router.post("/user/signup", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.fields.email });

        if (!user) {
            if (
                req.fields.email &&
                req.fields.username &&
                req.fields.password
            ) {
                const salt = uid2(64);
                const token = uid2(64);
                const hash = SHA256(req.fields.password + salt).toString(
                    encBase64
                );

                const newUser = new User({
                    email: req.fields.email,
                    account: {
                        username: req.fields.username,
                        phone: req.fields.phone,
                    },
                    token: token,
                    hash: hash,
                    salt: salt,
                });
                await newUser.save();

                res.json({
                    _id: newUser._id,
                    token: newUser.token,
                    account: newUser.account,
                });
            } else {
                res.status(400).json({ message: "please enter username " });
            }
        } else {
            res.status(400).json({ message: "email already exist" });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post("/user/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.fields.email });
        if (user) {
            const password = req.fields.password;
            const newHash = SHA256(password + user.salt).toString(encBase64);

            if (newHash === user.hash) {
                res.json({
                    _id: user._id,
                    token: user.token,
                    account: user.account,
                });
            } else {
                res.status(400).json({ message: "password wrong" });
            }
        } else {
            res.status(400).json({ message: "email introuvable" });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
