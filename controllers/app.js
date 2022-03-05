const User = require('../models/user');
validator = require('validator');
const crypto = require('crypto');
const qr = require("qrcode");
const nodemailer = require('nodemailer');
const { File } = require('megajs');
const { default: mongoose } = require('mongoose');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'elielmungo9@gmail.com',
      pass: 'Dexter512'
    },
    tls: {
      rejectUnauthorized: false
  }
});

let code;

exports.home = (req, res) => {
    res.render("home");
};

exports.getForm = (req, res) => {
    res.render("signup");
};

exports.postForm = (req, res) => {
    const user = new User({
        _id: mongoose.Types.ObjectId(),
        first_name: req.body.fname.toLowerCase(),
        last_name: req.body.lname.toLowerCase(),
        email: validator.normalizeEmail(req.body.email),
        imageUrl: res.locals.link
    });
    user.save()
        .then(() => {
            code = crypto.randomBytes(4).toString('hex');
            const num = Math.floor(Math.random()*100);
            const mailOptions = {
              from: 'elielmungo9@gmail.com',
              to: 'elielmungo9@icloud.com',
              subject: `USCITECH ${num} mail validation`,
              text: `Votre code de validation: ${code}`
            };
            transporter.sendMail(mailOptions, (error, info) => {
              if(error){
                  console.log(error);
                  User.deleteOne({ _id: user._id })
                    .then(() => {
                        res.render('error', { status: 500, message: 'Une erreur est survenue, veuillez réesayer S\'il vous plaît' });
                    })
                    .catch(error => {
                        console.log(error);
                        res.render('error', { status: 500, message: 'Une erreur est survenue, veuillez réesayer S\'il vous plaît' });
                    });
              }else{
                res.render("validate", { email: user.email });
              }
            })
        })
        .catch(error => {
            console.log(error);
            res.render("error",
                { status: 400,
                  message: 'Données entrées invalides, cela pourrait être:<ul><li>L\'adresse email entrée a déjà été utilisée</li><li>Une erreur interne du serveur</li></ul>Veuillez réessayer s\'il vous plaît.' });
        });
};

exports.generate = (req, res) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if(req.body.code === code){
                user ? (() => {
                    qr.toFile(`./public/qrcodes/${user._id}.png`, `${req.protocol}://${req.get('host')}/${user._id}`, (err) => {
                        if (err) res.render("error");
                        const full_name = user.first_name + ' ' + user.last_name;
                        res.render("bye", {identity: full_name.toUpperCase(), src: `${req.protocol}://${req.get('host')}/public/qrcodes/${user._id}.png`});
                    });
                })() : (() => {
                    res.render('error', {
                        status: 404,
                        message: 'Code introuvable, veuillez réesayer s\'il vous plaît. Ou contactez-nous pour obtenir de l\'aide.'
                    });
                })();
            }else {
                User.deleteOne({ _id: user._id })
                    .then(() => {
                        res.render('error', {
                            status: 400,
                            message: 'Code invalide, veuillez réesayer s\'il vous plaît.'
                        });
                    })
                    .catch(error => {
                        console.log(error);
                        res.render('error', { status: 500, message: 'Une erreur est survenue, veuillez réesayer s\'il vous plaît' });
                    })
            }
        })
        .catch(error => {
            console.log(error);
            res.render('error', {
                status: 400,
                message: 'Une erreur est survenue, veuillez réesayer s\'il vous plaît.'
            });
        })
};

exports.ticket = (req, res) => {
    User.findOne({ _id: req.params.user_id })
      .then(user => {
          user ?
            (() => {
                const file = File.fromURL(user.imageUrl);
                file.download((err, data) => {
                    if(err){
                        console.log(error);
                        res.render('error', {status: 500, message: 'Une erreur est survenue, veuillez essayer à nouveau s\'il vous plaît.'});
                    }
                    res.render('billet',
                        {identity: user.first_name+' '+user.last_name,
                        src: `data:image/jpg;base64,${data.toString('base64')}`
                    });
                })
            })():
            (() => res.render('error', {status: 404, message: 'QR Code invalide, veuillez nous contacter pour obtenir de l\'aide'}))();
      })
      .catch(error => {
          console.log(error);
          res.render('error', {status: 500, message: 'Une erreur est survenue, veuillez essayer à nouveau s\'il vous plaît.'})
        });
};

exports.regenerate = (req, res) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            user ? (() => {
                qr.toFile(`./public/qrcodes/${user._id}.png`, `${req.protocol}://${req.get('host')}/${user._id}`, (err) => {
                    if (err) res.render("error");
                    const full_name = user.first_name + ' ' + user.last_name;
                    res.render("bye", {identity: full_name.toUpperCase(), src: `${req.protocol}://${req.get('host')}/public/qrcodes/${user._id}.png`});
                });
            })() : (() => {
                res.render('error', {
                    status: 400,
                    message: 'Une erreur est survenue, veuillez réesayer s\'il vous plaît.'
                });
            })();
        })
        .catch(error => {
            console.log(error);
            res.status(400).json({ error });
        })
};