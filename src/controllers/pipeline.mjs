import axios from 'axios';

const RANDOMMER_API_KEY = 'e729c3ca2ab8420da6cd346fa977340b';

const headers = {
  'X-Api-Key': RANDOMMER_API_KEY
};

const getRandomUser = () => axios.get('https://randomuser.me/api/').then((res) => res.data.results[0]);

const getPhone = () => axios.get('https://randommer.io/api/Phone/Generate?CountryCode=FR&Quantity=1', { headers }).then((res) => res.data);

const getIBAN = () => axios.get('https://randommer.io/api/Finance/Iban/FR', { headers }).then((res) => res.data);

const getCreditCard = () => axios.get('https://randommer.io/api/Card?type=AmericanExpress', { headers }).then((res) => res.data);

const getFullName = () => axios.get('https://randommer.io/api/Name?nameType=fullname&quantity=1', { headers }).then((res) => res.data);

const getSocialNumber = () => axios.get('https://randommer.io/api/SocialNumber', { headers }).then((res) => res.data);

class Pipeline {
  constructor(app) {
    this.app = app;
    this.registerRoute();
  }

  registerRoute() {
    this.app.get('/generate', async (req, res) => {
      try {
        const [user, phone, iban, card, fullname, snumber] = await Promise.all([
          getRandomUser(),
          getPhone(),
          getIBAN(),
          getCreditCard(),
          getFullName(),
          getSocialNumber()
        ]);

        const result = {
          generatedData1: { user },
          generatedData2: {
            phone,
            iban,
            card,
            fullname,
            snumber
          }
        };

        res.status(200).json(result);
      } catch (err) {
        console.error('[ERROR] /generate ->', err.message);
        res.status(500).json({ message: 'Erreur lors de la récupération des données enrichies.' });
      }
    });
  }
}

export default Pipeline;
