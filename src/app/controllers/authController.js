const express = require('express');
const bcrypt = require('bcryptjs')
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth.json')
const mailer = require('../../modules/mailer');
const crypto = require('crypto');


const router = express.Router();


function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400
    })
}


router.post('/register', async (req, res) => {
    const { email } = req.body;
    try {
        if (await User.findOne({ email }))

            return res.status(400).send({ error: "usuario ja cadastrado" })

        const user = await User.create(req.body);

        return res.send({

            user,
            token: generateToken({ id: user.id })

        });
    } catch (err) {
        return res.status(400).send({ error: 'Registration falid' })
    }
})


router.post('/autheticate', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user)
        return res.status(400).send({ error: 'user not found' });
    if (!await bcrypt.compare(password, user.password))
        return res.status(400).send({ error: 'Invalid password' })

    user.password = undefined;



    res.send({

        user,
        token: generateToken({ id: user.id })

    });

});


router.post('/forgot_password', async (req, res) => {
    const { email } = req.body

    try {

        const user = await User.findOne({ email });

        if (!user)
            return res.status(400).send({ error: "user not found" });

        const token = crypto.randomBytes(20).toString('hex');


        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now,
            }
            }, { new: true, useFindAndModify: false }
            );


        mailer.sendMail({
            to: email,
            from: 'outletnewoakley@gmail.com',
            template: 'auth/forgot_password',
            context: {token},
        }, (err) =>{
            if(err)
                return res.status(400).send({error: 'error canot send forgot password email'})
                return res.send();
            })

    } catch (err) {
        console.log(err)
        res.status(400).send({ error: 'Faild error on forgot password, try again' })
    }

})


router.post('/reset_password', async (req, res) =>{
    const {email, token, password} = req.body
    try{
        const user = await User.findOne({ email })
        .select('+passwordResetToken passwordResetExpires');

        if (!user)
        return res.status(400).send({ error: "user not found" });

        if(token !== user.passwordResetToken)
        return res.status(400).send({ error: "Token invalid" });

        const now = new Date();
        if(now > user.passwordResetExpires)
        return res.status(400).send({ error: "Token invalid, generate new one token" });

        user.password = password

        await user.save();

        res.send();
    }catch(err){
        res.status(400).send({error: 'not found reset password'})
    }

})

module.exports = app => app.use('/auth', router);
