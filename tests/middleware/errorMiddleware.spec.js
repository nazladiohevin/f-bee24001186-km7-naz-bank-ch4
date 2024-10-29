import request from "supertest";
import { describe, expect, it } from "@jest/globals";
import app from "../../app.js";

const triggerError = (app, error) => {
  app.use((req, res, next) => {
    next(error);
  });
};

describe('Error Handling Middleware', () => {
  it('should return 400 if error is from Joi', async () => {
    const joiError = new Error('Validation error');
    joiError.isJoi = true;

    triggerError(app, joiError);

    const response = await request(app).get('/api/v1/users');
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Validation error' });
  });

  it('should return 500 for non-Joi errors', async () => {
    const genericError = new Error('Some server error');

    triggerError(app, genericError);

    const response = await request(app).get('/api/v1/users');
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Internal server error' });
  });
});