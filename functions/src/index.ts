import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as bodyParser from "body-parser";

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

const app = express();
const main = express();

main.use('/api/v1', app);
main.use(bodyParser.json());

export const webApi = functions.https.onRequest(main);

app.post('/pizzas', async (request, response) => {
  try {
    const { winner, losser, title } = request.body;
    const data = {
      winner,
      losser,
      title
    }
    const fightRef = await db.collection('pizzas').add(data);
    const fight = await fightRef.get();

    response.json({
      id: fightRef.id,
      data: fight.data()
    });

  } catch (error) {
    response.status(500).send(error);
  }
});

app.get('/pizzas/:id', async (request, response) => {
  try {
    const fightId = request.params.id;
    if (!fightId) throw new Error('Fight ID is required');
    const fight = await db.collection('pizzas').doc(fightId).get();
    if (!fight.exists) {
      throw new Error('Fight doesnt exist.')
    }
    response.json({
      id: fight.id,
      data: fight.data()
    });
  } catch (error) {
    response.status(500).send(error);
  }
});

app.get('/pizzas', async (request, response) => {
  try {
    const fightQuerySnapshot = await db.collection('pizzas').get();
    const pizzas: any[] = [];
    fightQuerySnapshot.forEach(
      (doc) => {
        pizzas.push({
          id: doc.id,
          data: doc.data()
        });
      }
    );
    response.json(pizzas);
  } catch (error) {
    response.status(500).send(error);
  }
});

app.put('/pizzas/:id', async (request, response) => {
  try {
    const fightId = request.params.id;
    const title = request.body.title;

    if (!fightId) throw new Error('id is blank');
    if (!title) throw new Error('Title is required');
    const data = {
      title
    };
    await db.collection('pizzas')
      .doc(fightId)
      .set(data, { merge: true });
    response.json({
      id: fightId,
      data
    })
  } catch (error) {
    response.status(500).send(error);
  }
});

app.delete('/pizzas/:id', async (request, response) => {
  try {
    const fightId = request.params.id;
    if (!fightId) throw new Error('id is blank');
    await db.collection('pizzas')
      .doc(fightId)
      .delete();
    response.json({
      id: fightId,
    })
  } catch (error) {
    response.status(500).send(error);
  }
});
