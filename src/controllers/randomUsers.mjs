import axios from 'axios';

class RandomUserController {
  constructor(app) {
    this.app = app;
    this.registerRoutes();
  }

  registerRoutes() {
    this.app.get('/random-user', async (req, res) => {
      try {
        const { gender, nat } = req.query;

        const response = await axios.get('https://randomuser.me/api/', {
          params: {
            gender,
            nat
          }
        });

        const user = response.data.results[0];

        res.status(200).json({
          name: `${user.name.first} ${user.name.last}`,
          email: user.email,
          gender: user.gender,
          nationality: user.nat,
          country: user.location.country,
          picture: user.picture.large
        });
      } catch (err) {
        console.error('[ERROR] /random-user ->', err.message);
        res.status(500).json({ message: 'Erreur lors de la récupération de l’utilisateur.' });
      }
    });
  }
}

export default RandomUserController;
