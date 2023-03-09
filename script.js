require('console-stamp')(console, 'yyyy-mm-dd HH:MM:ss');
require('dotenv').config();

const commander = require("commander");
const nodemailer = require('nodemailer'),
    fs = require('fs'),
    hogan = require('hogan.js'),
    inlineCss = require('inline-css');

commander
    .version("1.0.0")
    .usage('[options]')
    .option('-t, --template <template>', 'Template to use')
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


async function send_email(params) {
    const new_user_template = fs.readFileSync(__dirname + "/templates/new-user.html");
    const reset_password_template = fs.readFileSync(__dirname + "/templates/reset-password.html");
    const reset_password_success_template = fs.readFileSync(__dirname + "/templates/reset-password-success.html");
    const ticket_received_template = fs.readFileSync(__dirname + "/templates/ticket-received.html");
    const verif_code_template = fs.readFileSync(__dirname + "/templates/verif-code.html");

    const templates = {
        "new-user": new_user_template,
        "reset-password": reset_password_template,
        "reset-password-success": reset_password_success_template,
        "ticket-received": ticket_received_template,
        "verif-code": verif_code_template,
    }
    if (!params.template || !templates[params.template]) {
        console.error("Invalid template");
        return;
    }
    try {
        const templateFile = templates[params.template];
        const templateStyled = await inlineCss(templateFile.toString(), {url: "file://" + __dirname + "/template/"});
        const templateCompiled = hogan.compile(templateStyled);
        const templateRendered = templateCompiled.render(
            {
                name: params.name,
                callbackUrl: params.callbackUrl,
                token: params.token,
            });
        const emailData = {
            to: [
                "hrichard206@gmail.com"
            ],
            from: 'Hugo Richard',
            subject: "Test",
            html: templateRendered,
        };
        await transporter.sendMail(emailData);
    } catch (e) {
        console.error(e);
    }
}

async function launchScript() {
    const params = {
        template: program.template,
        name: "Hugo Richard",
        token: "123456789",
        callbackUrl: "https://www.google.com"
    }
    await send_email(params);
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
