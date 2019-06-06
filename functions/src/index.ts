import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as bodyParser from 'body-parser';
const cors = require('cors');


admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

const app = express();
const main = express();

main.use('/api/v1', app);
main.use(bodyParser.json());
main.use(cors());

export const webApi = functions.https.onRequest(main);

// Create a pizzeria
app.post('/pizzeria', async (request, response) => {
  try {
    const { id, name, slogan } = request.body;
    if (!id) throw new Error('pizzeria ID is required');
    const data = {
      id,
      name,
      slogan
    }
    const pizzeriaRef = await db.collection('pizzeria').doc(id)
    await pizzeriaRef.set(data);
    const pizzeria = await pizzeriaRef.get();

    response.json(pizzeria.data());

  } catch (error) {
    response.status(500).send(error);
  }
});

// get pizzeria data
app.get('/pizzeria/:id', async (request, response) => {
  try {
    const pizzeriaId = request.params.id;
    if (!pizzeriaId) throw new Error('pizzeria ID is required');
    const pizzeria = await db.doc(`pizzeria/${pizzeriaId}`).get();
    if (!pizzeria.exists) {
      throw new Error('pizza doesnt exist.')
    }
    response.json(pizzeria.data());
  } catch (error) {
    response.status(500).send(error);
  }
});

// add a new pizza to a given pizzeria
app.post('/pizzeria/:pizzeriaId/pizzas', async (request, response) => {
  try {
    const { pizzeriaId } = request.params;
    const { name, desc, price } = request.body;
    const data = {
      name,
      desc,
      price
    }
    const pizzariaRef = await db.doc(`pizzeria/${pizzeriaId}`);
    await pizzariaRef.collection("pizzas").doc(name).set(data);
    const pizza = await pizzariaRef.collection("pizzas").doc(name).get();

    response.json(pizza.data());

  } catch (error) {
    response.status(500).send(error);
  }
});

// fetch pizza data from a pizzeria
app.get('/pizzeria/:pizzeriaId/pizzas/:pizzaId', async (request, response) => {
  try {
    const { pizzaId, pizzeriaId } = request.params;
    if (!pizzaId) throw new Error('pizza ID is required');
    if (!pizzeriaId) throw new Error('pizzeria ID is required');
    const pizzariaRef = await db.doc(`pizzeria/${pizzeriaId}`);
    const pizza = await pizzariaRef.collection('pizzas').doc(pizzaId).get();
    if (!pizza.exists) {
      throw new Error('pizza doesnt exist.')
    }
    response.json(pizza.data());
  } catch (error) {
    response.status(500).send(error);
  }
});

// returns pizza collection from a given pizzeria
app.get('/pizzeria/:pizzeriaId/pizzas', async (request, response) => {
  try {
    const { pizzeriaId } = request.params;
    if (!pizzeriaId) throw new Error('pizzeria ID is required');
    const pizzariaRef = await db.doc(`pizzeria/${pizzeriaId}`);
    const pizzaQuerySnapshot = await pizzariaRef.collection('pizzas').get();
    const pizzas: any[] = [];
    pizzaQuerySnapshot.forEach(
      (doc) => { pizzas.push(doc.data()); }
    );
    response.json(pizzas);
  } catch (error) {
    response.status(500).send(error);
  }
});

// update a pizza
app.put('/pizzeria/:pizzeriaId/pizzas/:pizzaId', async (request, response) => {
  try {
    const { pizzeriaId, pizzaId } = request.params;
    const { price, desc } = request.body;

    if (!pizzaId) throw new Error('id is blank');
    if (!price) throw new Error('price is required');
    if (!desc) throw new Error('desc is required');
    const data = {
      desc,
      price
    };
    const pizzariaRef = await db.doc(`pizzeria/${pizzeriaId}`);
    await pizzariaRef.collection('pizzas')
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

// delete a pizza
app.delete('/pizzeria/:pizzeriaId/pizzas/:pizzaId', async (request, response) => {
  try {
    const { pizzeriaId, pizzaId } = request.params;
    if (!pizzaId) throw new Error('id is blank');
    if (!pizzeriaId) throw new Error('pizzeriaId is blank');
    const pizzariaRef = await db.doc(`pizzeria/${pizzeriaId}`);
    await pizzariaRef.collection('pizzas')
      .doc(pizzaId)
      .delete();
    response.json({
      id: pizzaId,
    })
  } catch (error) {
    response.status(500).send(error);
  }
});
