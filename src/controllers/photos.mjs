import PhotoModel from '../models/photo.mjs';
import AlbumModel from '../models/album.mjs';

const Photos = class Photos {
  constructor(app, connect) {
    this.app = app;
    this.PhotoModel = connect.model('Photo', PhotoModel);
    this.AlbumModel = connect.model('Album', AlbumModel);
    this.run();
  }

  create() {
    this.app.post('/album/:idalbum/photo', (req, res) => {
      try {
        const photoData = { ...req.body, album: req.params.idalbum };
        const photoModel = new this.PhotoModel(photoData);
        photoModel.save().then((newPhoto) => this.AlbumModel.findByIdAndUpdate(
          req.params.idalbum,
          { $push: { photos: newPhoto._id } }
        ).then(() => this.AlbumModel.findById(req.params.idalbum)
          .populate('photos')
          .then((updatedAlbum) => res.status(200).json(updatedAlbum || {}))
          .catch(() => res.status(200).json({})))
          .catch(() => res.status(200).json({})))
          .catch(() => res.status(200).json({}));
      } catch (err) {
        console.error(`[ERROR] photos/create -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  put() {
    this.app.put('/album/:idalbum/photo/:idphotos', (req, res) => {
      try {
        this.PhotoModel.findOneAndUpdate(
          { _id: req.params.idphotos, album: req.params.idalbum },
          req.body,
          { new: true }
        ).then((updatedPhoto) => {
          if (!updatedPhoto) {
            res.status(404).json({ code: 404, message: 'Photo not found' });
          }

          this.AlbumModel.findById(req.params.idalbum)
            .populate('photos')
            .then((updatedAlbum) => res.status(200).json(updatedAlbum || {}))
            .catch(() => res.status(200).json(updatedPhoto || {}));
        }).catch(() => res.status(500).json({
          code: 500,
          message: 'Internal Server error'
        }));
      } catch (err) {
        console.error(`[ERROR] photos/update -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  getOnePhotoInTheAlbumId() {
    this.app.get('/album/:idalbum/photos/:idphotos', (req, res) => {
      try {
        this.PhotoModel.findOne({
          album: req.params.idalbum,
          _id: req.params.idphotos

        })
          .then((photo) => {
            if (!photo) {
              res.status(404).json({ code: 404, message: 'Photo not found' });
            }
            res.status(200).json(photo || {});
          }).catch(() => res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          }));
      } catch (err) {
        console.error(`[ERROR] photos/:idphotos -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  getEveryPhotosInTheAlbumId() {
    this.app.get('/album/:idalbum/photos', (req, res) => {
      try {
        this.AlbumModel.findById(req.params.idalbum)
          .populate('photos')
          .then((album) => {
            if (!album) {
              res.status(404).json({ code: 404, message: 'Album not found' });
            }
            res.status(200).json(album.photos || []);
          }).catch(() => res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          }));
      } catch (err) {
        console.error(`[ERROR] photos/:idalbum -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  deleteById() {
    this.app.delete('/album/:idalbum/photo/:idphotos', (req, res) => {
      try {
        this.PhotoModel.findOneAndDelete({
          _id: req.params.idphotos,
          album: req.params.idalbum
        }).then((deletedPhoto) => {
          if (!deletedPhoto) {
            res.status(404).json({ code: 404, message: 'Photo not found' });
          }

          this.AlbumModel.findByIdAndUpdate(
            req.params.idalbum,
            { $pull: { photos: req.params.idphotos } }
          ).then(() => this.AlbumModel.findById(req.params.idalbum)
            .populate('photos')
            .then((updatedAlbum) => res.status(200).json(updatedAlbum || {}))
            .catch(() => res.status(200).json({})))
            .catch(() => res.status(200).json({}));
        }).catch(() => res.status(500).json({
          code: 500,
          message: 'Internal Server error'
        }));
      } catch (err) {
        console.error(`[ERROR] photos/delete -> ${err}`);

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
    this.getOnePhotoInTheAlbumId();
    this.getEveryPhotosInTheAlbumId();
    this.deleteById();
  }
};

export default Photos;
