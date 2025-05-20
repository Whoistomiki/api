import authenticateToken from '../middlewares/auth.mjs';
import AlbumModel from '../models/album.mjs';

const Albums = class Albums {
  constructor(app, connect) {
    this.app = app;
    this.AlbumModel = connect.model('Album', AlbumModel);
    this.run();
  }

  create() {
    this.app.post('/album/', authenticateToken, (req, res) => {
      try {
        const albumModel = new this.AlbumModel(req.body);
        albumModel.save().then((album) => {
          res.status(200).json(album || {});
        }).catch(() => {
          res.status(200).json({});
        });
      } catch (err) {
        console.error(`[ERROR] albums/create -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  put() {
    this.app.put('/album/:id', authenticateToken, (req, res) => {
      try {
        this.AlbumModel.findByIdAndUpdate(req.params.id, req.body, {
          new: true
        }).then((album) => {
          res.status(200).json(album || {});
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
      } catch (err) {
        console.error(`[ERROR] albums/:id -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  getOneAlbum() {
    this.app.get('/album/:id', authenticateToken, (req, res) => {
      try {
        this.AlbumModel.findById(req.params.id).then((album) => {
          res.status(200).json(album || {});
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
      } catch (err) {
        console.error(`[ERROR] albums/ -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  getEveryAlbums() {
    this.app.get('/albums/', authenticateToken, (req, res) => {
      try {
        this.AlbumModel.find().then((albums) => {
          res.status(200).json(albums || []);
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
      } catch (err) {
        console.error(`[ERROR] albums/ -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  deleteById() {
    this.app.delete('/album/:id', authenticateToken, (req, res) => {
      try {
        this.AlbumModel.findByIdAndDelete(req.params.id).then((album) => {
          res.status(200).json(album || {});
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
      } catch (err) {
        console.error(`[ERROR] albums/:id -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  run() {
    this.create();
    this.put();
    this.getOneAlbum();
    this.getEveryAlbums();
    this.deleteById();
  }
};

export default Albums;
