// import the getUserNote handler from getUserNote.mjs
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { handler } from "../../../src/handlers/getUserNote.mjs";
// import Dynamodb Document Client from libs
import { ddbDocClient } from "../../../src/libs/ddbDocClient.mjs";

// importing the aws-sdk-mock-client library
import { mockClient } from "aws-sdk-client-mock";

describe('Test getUserNote handler', () => {
    // create a mock client
    const ddbMockClient  = mockClient(ddbDocClient);

    // reset the history and behavior of the moack after each test so they don't interfere with each other  

    beforeEach(() => {
        ddbMockClient.reset();
    })

    // invoke and test the getUserNote handler
    it('should get a user note from DynamoDB', async () => {

      const item = { noteId: '123', userId: 'abc123', note: 'This is a test note' }

      ddbMockClient.on(GetCommand).resolves({Item: item}); // mock the response from the GetCommand to return Item object as the response
      const mockEvent = {httpMethod: 'GET',
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