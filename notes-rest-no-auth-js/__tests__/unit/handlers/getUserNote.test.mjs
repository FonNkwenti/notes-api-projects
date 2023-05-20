// import the getUserNote handler from getUserNote.mjs
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { handler } from "../../../src/handlers/getUserNote.mjs";
// import Dynamodb Document Client from libs
import { ddbDocClient } from "../../../src/libs/ddbDocClient.mjs";

// importing the aws-sdk-mock-client library
import { mockClient } from "aws-sdk-client-mock";

const tableName = process.env.TABLE_NAME;

describe('Test getUserNote handler', () => {
    // create a mock client
    const ddbMockClient  = mockClient(ddbDocClient);

    // reset the history and behavior of the moack after each test so they don't interfere with each other  

    beforeEach(() => {
        ddbMockClient.reset();
    })

    // invoke and test the getUserNote handler
    it('should get an existing user note from DynamoDB', async () => {

      const mockEvent = {
        httpMethod: 'GET',
        queryStringParameters: {userId: 'abc123'},
        pathParameters: {noteId: '123'},
        resource: '/notes/{noteId}'
      }
      const item = {
        userId: 'abc123',
        noteId: '57b41921-9746-4496-aeb3-74605d081ce2',
        title: 'Test Note',
        content: 'Test Content',
        label: 'Test Label',
        createdAt: '2023-05-20T11:19:44.697Z',
        updatedAt: '2023-05-20T11:19:44.697Z'
      }

       // Define the response from the GetCommand
      const getUserNoteResponse = {
        Item: item
      }

      ddbMockClient.on(GetCommand).resolves(getUserNoteResponse); // mock the response from the GetCommand to the expected response

      const response = await handler(mockEvent);
        console.log("mockResponse===", response)

      // Assert that the response matches the expected output
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual(getUserNoteResponse.Item)
    
    })
}

)