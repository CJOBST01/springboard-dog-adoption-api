// test/dogs.test.js — mocha + chai-http integration test against an in-memory MongoDB.

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const chai = require('chai');
const chaiHttp = require('chai-http');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { app } = require('../app');
const db = require('../db');

chai.use(chaiHttp);
const { expect } = chai;

let mongo;

before(async function () {
  this.timeout(60000);
  mongo = await MongoMemoryServer.create();
  await db.connect(mongo.getUri());
});

after(async function () {
  this.timeout(20000);
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

async function registerAndLogin(username, password = 'password') {
  await chai.request(app).post('/auth/register').send({ username, password });
  const res = await chai.request(app).post('/auth/login').send({ username, password });
  return res.body.token;
}

beforeEach(async () => {
  for (const c of Object.values(mongoose.connection.collections)) {
    await c.deleteMany({});
  }
});

describe('Dog Adoption Platform', () => {
  it('lets a user register, log in, and own a dog', async () => {
    const token = await registerAndLogin('alice');
    const res = await chai.request(app)
      .post('/dogs')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Rex', description: 'Friendly Lab' });
    expect(res).to.have.status(201);
    expect(res.body.dog.name).to.equal('Rex');
  });

  it('rejects unauthenticated requests', async () => {
    const res = await chai.request(app).get('/dogs/registered');
    expect(res).to.have.status(401);
  });

  it('forbids self-adoption', async () => {
    const token = await registerAndLogin('alice');
    const create = await chai.request(app)
      .post('/dogs')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Rex', description: 'Friendly Lab' });
    const adopt = await chai.request(app)
      .post(`/dogs/${create.body.dog._id}/adopt`)
      .set('Authorization', `Bearer ${token}`)
      .send({ thankYouMessage: 'thanks me' });
    expect(adopt).to.have.status(403);
  });

  it('handles a full adoption cycle', async () => {
    const ownerToken = await registerAndLogin('alice');
    const adopterToken = await registerAndLogin('bob');

    const create = await chai.request(app)
      .post('/dogs')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Rex', description: 'Friendly Lab' });
    const dogId = create.body.dog._id;

    const adopt = await chai.request(app)
      .post(`/dogs/${dogId}/adopt`)
      .set('Authorization', `Bearer ${adopterToken}`)
      .send({ thankYouMessage: 'thanks!' });
    expect(adopt).to.have.status(200);
    expect(adopt.body.dog.status).to.equal('adopted');

    const adoptAgain = await chai.request(app)
      .post(`/dogs/${dogId}/adopt`)
      .set('Authorization', `Bearer ${adopterToken}`)
      .send({ thankYouMessage: 'twice?' });
    expect(adoptAgain).to.have.status(409);

    const remove = await chai.request(app)
      .delete(`/dogs/${dogId}`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(remove).to.have.status(409);

    const adoptedList = await chai.request(app)
      .get('/dogs/adopted')
      .set('Authorization', `Bearer ${adopterToken}`);
    expect(adoptedList.body.dogs).to.have.length(1);
  });

  it('paginates and filters registered dogs', async () => {
    const token = await registerAndLogin('alice');
    for (let i = 0; i < 3; i++) {
      await chai.request(app)
        .post('/dogs')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: `Dog ${i}`, description: 'desc' });
    }
    const res = await chai.request(app)
      .get('/dogs/registered?limit=2&page=1&status=available')
      .set('Authorization', `Bearer ${token}`);
    expect(res.body.dogs).to.have.length(2);
    expect(res.body.total).to.equal(3);
  });
});
