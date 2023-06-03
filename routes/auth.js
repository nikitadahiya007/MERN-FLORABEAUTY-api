const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

//REGISTER or create
router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PAAS_SEC
    ).toString(),
  });
  try {
    const savedUser = await newUser.save();
    // console.log(savedUser);
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});
//LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      res.status(401).json("wrong credentials");
      return;
    }
    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PAAS_SEC
    );
    const StringPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
    if (StringPassword !== req.body.password) {
      res.status(401).json("wrong credentials");
      return;
    }
    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SEC,
      { expiresIn: "320d" }
    );

    const { password, ...others } = user._doc;

    res.status(200).json({...others, accessToken});
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;

//CryptoJS.AES.decrypt(encrypted, "Secret Passphrase");
