import jwt from 'jsonwebtoken';
import Validator from 'better-validator';
import bcrypt from 'bcrypt';
import UserModel from '../models/user.mjs';

const JWT_SECRET = 'efrei';

const Users = class Users {
  constructor(app, connect) {
    this.app = app;
    this.UserModel = connect.model('User', UserModel);

    this.run();
  }

  create() {
    this.app.post('/user/', (req, res) => {
      const { email, password } = req.body;

      const validator = new Validator();
      validator((v) => {
        v('email', email).isEmail().required();
        v('password', password).minLength(6).required();
      });

      const errors = validator.run();
      if (errors.length > 0) {
        return res.status(400).json({
          code: 400,
          message: 'Bad request',
          errors
        });
      }

      return this.UserModel.findOne({ email })
        .then((existingUser) => {
          if (existingUser) {
            res.status(409).json({
              code: 409,
              message: 'User already exists'
            });
            return null;
          }

          return bcrypt.hash(password, 10);
        })
        .then((hashedPassword) => {
          if (!hashedPassword) {
            return null;
          }

          const newUser = new this.UserModel({
            email,
            password: hashedPassword
          });

          return newUser.save();
        })
        .then((savedUser) => {
          if (!savedUser) {
            return null;
          }

          return res.status(201).json({
            user: {
              email: savedUser.email,
              password: savedUser.password
            }
          });
        })
        .catch((err) => {
          console.error(`[ERROR] users/create -> ${err}`);

          return res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
    });
  }

  login() {
    this.app.post('/user/login', (req, res) => {
      const { email, password } = req.body;

      this.UserModel.findOne({ email })
        .then((user) => {
          if (!user) {
            return res.status(401).json({ message: 'Utilisateur non trouvé' });
          }

          return bcrypt.compare(password, user.password)
            .then((isValid) => {
              if (!isValid) {
                return res.status(401).json({ message: 'Mot de passe incorrect' });
              }

              const token = jwt.sign(
                { id: user._id, email: user.email },
                JWT_SECRET,
                { expiresIn: '1h' }
              );

              res.status(200).json({ token });
              return null;
            })
            .catch((err) => {
              console.error(`[ERROR] users/login -> compare: ${err}`);
              res.status(500).json({ message: 'Erreur serveur' });
              return null;
            });
        })
        .catch((err) => {
          console.error(`[ERROR] users/login -> findOne: ${err}`);
          res.status(500).json({ message: 'Erreur serveur' });
          return null;
        });

      return null;
    });
  }

  authGuard() {
    this.app.get('/user/protected', (req, res) => {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: 'Token manquant' });
      }

      jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
          return res.status(403).json({ message: 'Token invalide' });
        }

        res.json({ message: `Bienvenue ${user.email}, accès autorisé.` });
        return null;
      });

      return null;
    });
  }

  showById() {
    this.app.get('/user/:id', (req, res) => {
      try {
        this.UserModel.findById(req.params.id).then((user) => {
          res.status(200).json(user || {});
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
      } catch (err) {
        console.error(`[ERROR] users/:id -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  showEveryone() {
    this.app.get('/user/', (req, res) => {
      try {
        this.UserModel.find().then((users) => {
          res.status(200).json(users || {});
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
      } catch (err) {
        console.error(`[ERROR] users/ -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  deleteById() {
    this.app.delete('/user/:id', (req, res) => {
      try {
        this.UserModel.findByIdAndDelete(req.params.id).then((user) => {
          res.status(200).json(user || {});
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
      } catch (err) {
        console.error(`[ERROR] users/:id -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  run() {
    this.create();
    this.login();
    this.authGuard();
    this.showById();
    this.showEveryone();
    this.deleteById();
  }
};

export default Users;
