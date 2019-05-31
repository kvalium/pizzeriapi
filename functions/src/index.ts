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
    const { name, desc, price } = request.body;
    const data = {
      name,
      desc,
      price
    }
    const pizzaRef = await db.collection('pizzas').add(data);
    const pizza = await pizzaRef.get();

    response.json({
      id: pizzaRef.id,
      data: pizza.data()
    });

  } catch (error) {
    response.status(500).send(error);
  }
});

app.get('/pizzas/:id', async (request, response) => {
  try {
    const pizzaId = request.params.id;
    if (!pizzaId) throw new Error('pizza ID is required');
    const pizza = await db.collection('pizzas').doc(pizzaId).get();
    if (!pizza.exists) {
      throw new Error('pizza doesnt exist.')
    }
    response.json({
      id: pizza.id,
      data: pizza.data()
    });
  } catch (error) {
    response.status(500).send(error);
  }
});

app.get('/pizzas', async (request, response) => {
  try {
    const pizzaQuerySnapshot = await db.collection('pizzas').get();
    const pizzas: any[] = [];
    pizzaQuerySnapshot.forEach(
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
    const pizzaId = request.params.id;
    const price = request.body.price;

    if (!pizzaId) throw new Error('id is blank');
    if (!price) throw new Error('price is required');
    const data = {
      price
    };
    await db.collection('pizzas')
      .doc(pizzaId)
      .set(data, { merge: true });
    response.json({
      id: pizzaId,
      data
    })
  } catch (error) {
    response.status(500).send(error);
  }
});

app.delete('/pizzas/:id', async (request, response) => {
  try {
    const pizzaId = request.params.id;
    if (!pizzaId) throw new Error('id is blank');
    await db.collection('pizzas')
      .doc(pizzaId)
      .delete();
    response.json({
      id: pizzaId,
    })
  } catch (error) {
    response.status(500).send(error);
  }
});
