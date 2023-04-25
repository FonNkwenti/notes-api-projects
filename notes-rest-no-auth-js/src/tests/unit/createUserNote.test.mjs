'use strict';

import { handler } from '../../createUserNote.mjs';
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../../../../libs/ddbDocClient.mjs";
import { readFileSync } from "fs";

const event = readFileSync('./events/createUserNote.json');

console.log(event.body)

describe('Unit test for Lambda function', () => {
    it('should create a note', async () => {
      // Create a mock DDB client
      const ddbDocClient = new AWS.DynamoDB.DocumentClient();
      ddbDocClient.send.mockResolvedValue({
        attributes: {
          userId: '1234567890',
          noteId: 'abcd1234',
          title: 'My Note',
          content: 'This is my note.',
          label: 'none',
          createdAt: '2023-04-25T00:00:00.000Z',
          updatedAt: '2023-04-25T00:00:00.000Z',
        },
      });
  
      // Create a test event
      const event = {
        httpMethod: 'POST',
        queryStringParameters: {
          userId: '1234567890',
        },
        body: JSON.stringify({
          title: 'My Note',
          content: 'This is my note.',
        }),
      };
  
      // Call the Lambda function
      const result = await lambdaHandler(event);
  
      // Assert that the Lambda function returns the expected response
      expect(result.statusCode).toEqual(201);
      expect(result.body).toEqual(JSON.stringify({
        userId: '1234567890',
        noteId: 'abcd1234',
        title: 'My Note',
        content: 'This is my note.',
        label: 'none',
        createdAt: '2023-04-25T00:00:00.000Z',
        updatedAt: '2023-04-25T00:00:00.000Z',
      }));
    });
  
    it('should throw an error if the HTTP method is not POST', async () => {
      // Create a test event
      const event = {
        httpMethod: 'GET',
        queryStringParameters: {
          userId: '1234567890',
        },
        body: JSON.stringify({
          title: 'My Note',
          content: 'This is my note.',
        }),
      };
  
      // Call the Lambda function
      try {
        await lambdaHandler(event);
      } catch (err) {
        // Assert that the Lambda function throws an error
        expect(err).toBeDefined();
        expect(err.message).toEqual('Expecting POST method, received GET');
      }
    });
  
    it('should throw an error if the userId is not provided', async () => {
      // Create a test event
      const event = {
        httpMethod: 'POST',
        queryStringParameters: {},
        body: JSON.stringify({
          title: 'My Note',
          content: 'This is my note.',
        }),
      };
  
      // Call the Lambda function
      try {
        await lambdaHandler(event);
      } catch (err) {
        // Assert that the Lambda function throws an error
        expect(err).toBeDefined();
        expect(err.message).toEqual('Expecting a userId, received {}');
      }
    });
  });
