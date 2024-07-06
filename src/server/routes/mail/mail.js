import express from 'express'
import sendEmail from './mailer.js';
import { v4 as uuidv4 } from 'uuid';
//Caching
import { cache_functions } from '../../caching/caching.js';
const { setters, getters } = cache_functions
const { set_mail_id } = setters;
const { get_mail_id } = getters;
//
const router = express.Router();
const htmlContent = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmation Page</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            text-align: center;
            margin: 0;
            padding: 0;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        h1 {
            font-size: 36px;
            margin-bottom: 20px;
        }

        h2 {
            font-size: 24px;
            margin-bottom: 20px;
        }

        #uniqueId {
            font-size: 30px;
            font-weight: bold;
            color: black;
        }
    </style>
</head>

<body>
    <div class="container">
        <h1>Hello!</h1>
        <h2>Please find your confirmation code below:</h2>
        <h1 id="uniqueId"></h1>
    </div>
</body>

</html>


`;

router.post('/send-mail', async (req, res) => {
    try {
        const { to, userid } = req.body;
        const id = uuidv4();
        let modifiedHtmlContent = htmlContent.replace('<h1 id="uniqueId"></h1>', `<h1 id="uniqueId">${id}</h1>`);
        const { success } = await sendEmail(to, 'brainstormish identity confirmation', modifiedHtmlContent);
        if (success) {
            await set_mail_id(userid, id);
            res.status(200).json({ message: 'Email sent successfully !' });
        }
    } catch (error) {
        res.status(400).send({ err: 'Something went wrong !' });
    }
});

router.get('/verify-id', async (req, res) => {
    try {
        const { userid, input } = req.query;
        const id = await get_mail_id(userid);
        if (input === id) {
            res.status(200).json({ message: 'Code verified succesfully !' });
            await set_mail_id(userid, "granted");
        }
        else return res.status(400).send({ err: 'The code is wrong . Trying again will send another code .' });
    } catch (error) {
        res.status(400).send({ err: 'Something went wrong !' });
    }
});

export default router;