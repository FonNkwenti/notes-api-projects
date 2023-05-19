/**
 * The createUserNote function.
 * What does this function do? The createUserNote function expects API Gateway Proxy event with an HTTP POST method, are resouce path of /notes, and a JSON body. It also expects to receive a 'userId' parameter as a query string parameter. The JSON body should contain the following fields: 'title', 'content', and 'label'
 * When the function gets the request from the API Gateway proxy event, it will generate a UUID for the noteId field and set the createAt and updatedAt fields 
 * Then function will use the PutCommand from the ddDocClient object to create the item in DynamoDB. A successful operation should return a 201 HTTP status code and a response body.
 * A failed operation should return a 500 status code
 * 
 */

/** Our test suite
 * 1. The first test case checks if a note is create in DynamoDB with the correct properties when the function is invoked with a valid HTTP POST request
 * 2. The second test case checks if the function throws an error when the HTTP method is not POST.
 * 3. The third test case checks if the function throws an error when the userId is missing from the query string parameters.
 * 
 * 
 * 
 */

/** How?
 * 1. use the mock client for DynamoDB to simulate the behavior of the real DynamoDB client.
 * 2. set up the expectations of the mock client. We expect the mock client to return the specified object whenever the PutCommand method is called.
 * 3. Invoke the handler function with a request that contains the userId, noteId and other attributes.
 * 4. Check the results of the handler to make sure that it matches the expected result
 */


// import the createUserNote handler from createUserNote.mjs
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { handler } from "../../../src/handlers/createUserNote.mjs";
// import Dynamodb Document Client from libs
import { ddbDocClient } from "../../../src/libs/ddbDocClient.mjs";
import { randomUUID } from "crypto";

// importing the aws-sdk-mock-client library
import { mockClient } from "aws-sdk-client-mock";

describe('Test createUserNote handler', () => {
    // use the imported mockClient from the aws-sdk-client-mock library to create a mock DynamoDB Document Client object
    const ddbMockClient  = mockClient(ddbDocClient);

    // reset the history and behavior of the mock client after each test so they don't interfere with each other  

    beforeEach(() => {
        ddbMockClient.reset();
    })

    // invoke and test the createUserNote handler
    it('should create a user note in DynamoDB', async () => {

      const item = { noteId: '123', userId: 'abc123', note: 'This is a test note' }

      ddbMockClient.on(PutCommand).resolves({Item: item}); // mock the response from the PutCommand to return Item object as the response
      const mockEvent = {
      httpMethod: 'POST',
      queryStringParameters: {userId: 'abc123'},
      pathParameters: {noteId: '123'},
      resource: '/notes/{noteId}'
      }

      const result = await handler(mockEvent);

      const expectedResult = {
        statusCode: 200,
        body: JSON.stringify(item)
      
      }

      // compare the result with the expected result
      expect(result).toEqual(expectedResult)
    
    })
}

)