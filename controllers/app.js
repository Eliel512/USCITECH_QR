const User = require('../models/user');
const validator = require('validator');
const crypto = require('crypto');
const qr = require("qrcode");
const { File } = require('megajs');
const { default: mongoose } = require('mongoose');

exports.home = (req, res) => {
    res.render("home");
};

exports.getForm = (req, res) => {
    res.render("signup");
};

exports.getConfirm = (req, res) => {
    res.render("confirm");
};

exports.postForm = (req, res) => {
    const code = crypto.randomBytes(4).toString('hex');
    const user = new User({
        _id: mongoose.Types.ObjectId(),
        first_name: req.body.fname.toUpperCase(),
        last_name: req.body.lname.toUpperCase(),
        email: validator.normalizeEmail(req.body.email),
        code: code,
        imageUrl: res.locals.link
    });
    user.save()
        .then(() => {
            res.render("validate", { email: user.email });
        })
        .catch(error => {
            console.log(error);
            res.render("error",
                { status: 400,
                  message: 'Données entrées invalides, cela pourrait être:<ul><li>L\'adresse email entrée a déjà été utilisée</li><li>Une erreur interne du serveur</li></ul>Veuillez réessayer s\'il vous plaît.' });
        });
};

exports.confirm = (req, res) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if(req.body.code === user.code){
                user ? (() => {
                    User.updateOne({ _id: user._id }, {$set: {
                        status: true
                    }})
                      .then(() => {
                        qr.toFile(`./public/qrcodes/${user._id}.png`, `${req.protocol}://${req.get('host')}/${user._id}`, (err) => {
                            if(err){
                                res.render("error", {
                                    status: 500,
                                    message: "Une erreur est survenue, veuillez essayer de regénérer votre QR code à partir de l'acceuil ou <a href='mailto:elielmungo9@gmail.com'>contactez-nous</a> pour obtenir de l'aide."
                                });
                            }
                            const full_name = user.first_name + ' ' + user.last_name;
                            res.render("bye", {identity: full_name.toUpperCase(), src: `${req.protocol}://${req.get('host')}/public/qrcodes/${user._id}.png`});
                        });
                      })
                      .catch(error => {
                        console.log(error);
                        res.render('error', {
                            status: 500,
                            message: 'Une erreur est survenue, veuillez réesayer s\'il vous plaît.'
                        });
                      });
                })() : (() => {
                    res.render('error', {
                        status: 404,
                        message: 'Code introuvable, veuillez réesayer s\'il vous plaît. Ou <a href=\'mailto:elielmungo9@gmail.com\'>contactez-nous</a> pour obtenir de l\'aide.'
                    });
                })();
            }else {
                res.render('error', {
                    status: 400,
                    message: 'Code invalide, veuillez réesayer s\'il vous plaît.'
                });
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

exports.generate = (req, res) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if(req.body.code === user.code){
                user ? (() => {
                    User.updateOne({ _id: user._id }, {$set: {
                        status: true
                    }})
                      .then(() => {
                        qr.toFile(`./public/qrcodes/${user._id}.png`, `${req.protocol}://${req.get('host')}/${user._id}`, (err) => {
                            if(err){
                                res.render("error", {
                                    status: 500,
                                    message: "Une erreur est survenue, veuillez essayer de regénérer votre QR code à partir de l'acceuil ou <a href='mailto:elielmungo9@gmail.com'>contactez-nous</a> pour obtenir de l'aide."
                                });
                            }
                            const full_name = user.first_name + ' ' + user.last_name;
                            res.render("bye", {identity: full_name.toUpperCase(), src: `${req.protocol}://${req.get('host')}/public/qrcodes/${user._id}.png`});
                        });
                      })
                      .catch(error => {
                        console.log(error);
                        res.render('error', {
                            status: 500,
                            message: 'Une erreur est survenue, veuillez réesayer s\'il vous plaît.'
                        });
                      });
                })() : (() => {
                    res.render('error', {
                        status: 404,
                        message: 'Code introuvable, veuillez réesayer s\'il vous plaît. Ou <a href=\'mailto:elielmungo9@gmail.com\'>contactez-nous</a> pour obtenir de l\'aide.'
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
                    res.render('billet',{
                        identity: user.first_name+' '+user.last_name,
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
                if(user.status){
                    qr.toFile(`./public/qrcodes/${user._id}.png`, `${req.protocol}://${req.get('host')}/${user._id}`, (err) => {
                        if(err){
                            console.log(err);
                            res.render("error", {
                                status: 500,
                                message: "Une erreur est survenue, veuillez reéssayer ou <a href='mailto:elielmungo9@gmail.com'>contactez-nous</a> pour obtenir de l'aide."
                            });
                        }
                        const full_name = user.first_name + ' ' + user.last_name;
                        res.render("bye", {identity: full_name.toUpperCase(), src: `${req.protocol}://${req.get('host')}/public/qrcodes/${user._id}.png`});
                    });
                }else{
                    res.render("error", {
                        status: 401,
                        message: "Il semblerait que vous n'avez pas encore finalisé votre paiement, veuillez le faire pour obtenir votre QR Code."
                    });
                }
            })() : (() => {
                res.render('error', {
                    status: 400,
                    message: 'Une erreur est survenue, veuillez réesayer s\'il vous plaît.'
                });
            })();
        })
        .catch(error => {
            console.log(error);
            res.render('error', {
                status: 400,
                message: "Données entrées invalides, veuillez réessayer s'il vous plait"
            });
        })
};

exports.table = (req, res) => {
    switch(req.params.status){
        case 'all':
            User.find({ })
              .then(users => {
                  let keys = {
                      ...User.schema.paths
                  }
                  delete keys._id;
                  delete keys.__v;
                  delete keys.imageUrl;
                  keys = Object.keys(keys);
                  res.render('table', {
                      keys: keys,
                      users: users
                    })
              })
              .catch(error => {
                  console.log(error);
                  res.render("error", {
                      status: 500,
                      message: error
                  });
              });
        break;
        case 'true':
            User.find({ status: true })
              .then(users => {
                  let keys = {
                      ...User.schema.paths
                  };
                  delete keys._id;
                  delete keys.__v;
                  delete keys.imageUrl;
                  keys = Object.keys(keys);
                  res.render('table', {
                      keys: keys,
                      users: users
                    })
              })
              .catch(error => {
                  console.log(error);
                  res.render("error", {
                      status: 500,
                      message: error
                  });
              });
        break;
        case 'false':
            User.find({ status: false })
              .then(users => {
                  let keys = {
                      ...User.schema.paths
                  };
                  delete keys._id;
                  delete keys.__v;
                  delete keys.imageUrl;
                  keys = Object.keys(keys);
                  res.render('table', {
                      keys: keys,
                      users: users
                    })
              })
              .catch(error => {
                  console.log(error);
                  res.render("error", {
                      status: 500,
                      message: error
                  });
              });
        break;
        default:
            res.render("error", {
                status: 400,
                message: "Données entrées invalides."
            });
    }
};