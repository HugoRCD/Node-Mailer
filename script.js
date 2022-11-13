require('console-stamp')(console, 'yyyy-mm-dd HH:MM:ss');
require('dotenv').config();

const commander = require("commander");
const mysql = require('mysql2/promise');
const dayjs = require('dayjs');
const nodemailer = require('nodemailer'),
    fs = require('fs'),
    hogan = require('hogan.js'),
    inlineCss = require('inline-css');

commander
    .version("1.0.0")
    .usage('[options]')
    .option('-e, --env <mode>', 'Select script environment: local, preprod or production')
    .parse(process.argv);

const program = commander.opts();
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

async function send_email() {
    try {
        const templateFile = fs.readFileSync(__dirname + "/template/template.html");
        const templateStyled = await inlineCss(templateFile.toString(), {url: "file://" + __dirname + "/template/"});
        const templateCompiled = hogan.compile(templateStyled);
        const templateRendered = templateCompiled.render(
            {
                name: "Hugo Richard"
            });
        const emailData = {
            to: [
                "hrichard206@gmail.Com"
            ],
            from: 'Maison Hochard',
            subject: "Test",
            html: templateRendered
        };
        await transporter.sendMail(emailData);
    } catch (e) {
        console.error(e);
    }
}

// request exemple
/*async function getSitesList(connection) {
    const [rows] = await connection.execute('SELECT id, Login FROM w2r_central.S_Account_Site WHERE enabled = 1');
    return rows;
}*/

async function launchScript() {
    // in case of db connection
    /*const connection = await mysql.createConnection({
        host: (program.env && program.env === "production")
            ? '10.5.0.4'
            : ((program.env && program.env === "preprod")
                ? '10.5.0.104'
                : 'localhost'),
        user: 'master',
        password: 'harmony33893389'
    });*/
    await send_email()
}

launchScript()
    .then(_ => {
        console.log("Script ended");
        process.exit();
    })
    .catch(e => {
        console.log("Script failed: " + e);
        process.exit();
    });
