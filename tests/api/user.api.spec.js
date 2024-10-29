import request from "supertest";
import app from "../../app.js";
import { describe, expect, test } from "@jest/globals";

describe("GET api/v1/getUsers", () => {
  test("Return list of users", async () => {
    const resp = await request(app).get("/api/v1/users");
    // Verifikasi status HTTP
    expect(resp.status).toBe(200);

    expect(Array.isArray(resp.body)).toBe(true);

    resp.body.forEach(user => {
      expect(user).toHaveProperty("email");
      expect(user).toHaveProperty("name");
      expect(user).toHaveProperty("password");
      expect(user).toHaveProperty("createdAt");
      expect(user).toHaveProperty("updateAt");
    });
  });
});

// If you have tested the user post, then when you test again, change the inputted data OR Comment this test
describe("POST api/v1/users", () => {
  test("if success update user, return success message and status 200", async () => {    
    const resp = await request(app).post(`/api/v1/users`).send({
      email: "hadiwarsito@gmail.com",
      name: "Hadi Warsito",      
      password: "1234567"
    });
    
    expect(resp.status).toEqual(200);
    expect(resp.body).toHaveProperty("message", "success");
  });
});

// If you have tested the user post, then when you test again, change the inputted data. OR Comment this test
describe("PUT api/v1/users/:id", () => {
  test("if success update user, return success message and status 200", async () => {
    const userId = 1;
    const resp = await request(app).put(`/api/v1/users/${userId}`).send({
      name: "Stepuniues" 
    });
    
    expect(resp.status).toEqual(200);
    expect(resp.body).toHaveProperty("message", "success");
  });

});

describe("GET api/v1/users", () => {
  test("return specific user by id", async () => {
    const userId = 1;
    const resp = await request(app).get(`/api/v1/users/${userId}`);

    
    expect(Array.isArray(resp.body)).toBe(true);
    
    resp.body.forEach(user => {
      expect(user).toHaveProperty("email");
      expect(user).toHaveProperty("name");
      expect(user).toHaveProperty("password");
      expect(user).toHaveProperty("createdAt");
      expect(user).toHaveProperty("updateAt");
      expect(user).toHaveProperty("profile");      
    });
  });
});