import { Before, Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { IFixture } from "../../hooks/FixtureManager";
import * as ms from 'ms';
setDefaultTimeout(ms('2 minutes'))

const BASE_URL = 'https://jsonplaceholder.typicode.com';

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

Before(function () {
  this.response = null;
});

When('I send a GET request to {string}', async function (endpoint) {
  let fixture = this.fixture as IFixture
  const { request } = fixture.page
  const response = await request.get(BASE_URL + endpoint);
  this.response = await response.json()
  this.statusCode = response.status();
});

When('I send a POST request to {string} with the following data:', async function (endpoint, dataTable) {
  let fixture = this.fixture as IFixture
  const { request } = fixture.page
  const data = dataTable.rowsHash();
  const response = await request.post(BASE_URL + endpoint, {
    data: data,
  });
  this.response = await response.json();
  this.statusCode = response.status();
});

When('I send a PUT request to {string} with the following data:', async function (endpoint, dataTable) {
  let fixture = this.fixture as IFixture
  const { request } = fixture.page
  const data = dataTable.rowsHash();
  const response = await request.put(BASE_URL + endpoint, {
    data: data,
  });
  this.response = await response.json();
  this.statusCode = response.status();
});

When('I send a PATCH request to {string} with the following data:', async function (endpoint, dataTable) {
  let fixture = this.fixture as IFixture
  const { request } = fixture.page
  const data = dataTable.rowsHash();
  const response = await request.patch(BASE_URL + endpoint, {
    data: data,
  });
  this.response = await response.json();
  this.statusCode = response.status();
});

When('I send a DELETE request to {string}', async function (endpoint) {
  let fixture = this.fixture as IFixture
  const { request } = fixture.page
  const response = await request.delete(BASE_URL + endpoint);
  this.statusCode = response.status();
});

Then('the response status code should be {int}', function (statusCode) {
  expect(this.statusCode).toBe(statusCode);
});

Then('the response should contain a list of posts', function () {
  const response = this.response as Post[];
  expect(Array.isArray(response)).toBe(true);
  expect(response.length).toBeGreaterThan(0);

  // Check that each post has the expected structure
  response.forEach(post => {
    expect(post).toHaveProperty('id');
    expect(post).toHaveProperty('userId');
    expect(post).toHaveProperty('title');
    expect(post).toHaveProperty('body');

    // Check that id and userId are numbers
    expect(typeof post.id).toBe('number');
    expect(typeof post.userId).toBe('number');

    // Check that title and body are strings
    expect(typeof post.title).toBe('string');
    expect(typeof post.body).toBe('string');
  });
});

Then('the response should contain the details of the post:', function (dataTable) {
  const response = this.response as Post;
  const expectedData = dataTable.rowsHash()
  expectedData.id = parseInt(expectedData.id);
  expectedData.userId = parseInt(expectedData.userId);
  expect(response).toEqual(expectedData);
});

Then('the response should contain the newly created post:', function (dataTable) {
  const { id, ...responseWithoutId } = this.response as Post;
  const expectedData = dataTable.rowsHash();
  expect(typeof id).toBe('number');
  expect(responseWithoutId).toEqual(expectedData);
});

Then('the response should contain the updated post:', function (dataTable) {
  const response = this.response as Post;
  const expectedData = dataTable.rowsHash();
  expectedData.id = parseInt(expectedData.id);
  expect(response).toEqual(expectedData);
});

Then('the response should contain the partially updated post:', function (dataTable) {
  const response = this.response as Post;
  const expectedData = dataTable.rowsHash();
  expectedData.userId = parseInt(expectedData.userId);
  expect(response).toEqual(expectedData);
});