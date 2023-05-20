// import the listUserNotes handler from listUserNotes.mjs
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { handler } from "../../../src/handlers/listUserNotes.mjs";
// import Dynamodb Document Client from libs
import { ddbDocClient } from "../../../src/libs/ddbDocClient.mjs";

// importing the aws-sdk-mock-client library
import { mockClient } from "aws-sdk-client-mock";

describe('Test listUserNotes handler', () => {
    // create a mock client
    const ddbMockClient  = mockClient(ddbDocClient);

    // reset the history and behavior of the moack after each test so they don't interfere with each other  

    beforeEach(() => {
        ddbMockClient.reset();
    })

    // invoke and test the listUserNotes handler
    it('should list all user notes from DynamoDB', async () => {

      const mockEvent = {
        httpMethod: 'GET',
        queryStringParameters: {
          userId: 'abc123'
        },
        resource: '/notes'
      }
      const item1 = {
        userId: 'abc123',
        noteId: '123',
        title: 'note 1',
        content: 'content 1',
        label: 'label 1',
        createdAt: '2023-05-20T11:19:44.697Z',
        updatedAt: '2023-05-20T11:19:44.697Z'
      }
      const item2 = {
        userId: 'abc123',
        noteId: '456',
        title: 'note 2',
        content: 'content 2',
        label: 'label 2',
        createdAt: '2023-05-20T11:19:44.697Z',
        updatedAt: '2023-05-20T11:19:44.697Z'
      }

       // Define the response from the QueryCommand
      const queryCommandResponse = {
        Items: [item1, item2]
      }

      ddbMockClient.on(QueryCommand).resolves(queryCommandResponse); // mock the response from the QueryCommand to the expected response

      const response = await handler(mockEvent);
        console.log("mockResponse===", response)

      // Assert that the response matches the expected output
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual(queryCommandResponse.Items)
    
    })
    it('should handle not notes found', async () => {
      const mockEvent = {
      httpMethod: 'GET',
      queryStringParameters: {
        userId: 'abc123'
      },
      resource: '/notes'
      }

      const queryCommandResponse = {
        Items: []
      };
      ddbMockClient.on(QueryCommand).resolves(queryCommandResponse); // mock the response from the QueryCommand to the expected response
      
      const response = await handler(mockEvent);
      expect(response.statusCode).toBe(200)
      expect(JSON.parse(response.body)).toEqual(queryCommandResponse.Items)
    })

  it('should return 400 if userId is not provided', async () => {
    const mockEvent = {
      httpMethod: 'GET',
      queryStringParameters: null,
      resource: '/notes'
    };



    try {
      await handler(mockEvent);
          } catch (error) {
            expect(error.message).toEqual('Expecting a userId, received null');
            console.log("error===", error)
    }
  
  })

  it("should handle incorrect resource path", async () => {
    const mockEvent = {
      httpMethod: "GET",
      resource: "/incorrect-path",
      queryStringParameters: {
        userId: "user123",
      },
    };

    try {
      await handler(mockEvent);
    } catch (error) {
      expect(error.message).toBe(
        "Expecting resource path /notes but received /incorrect-path path."
      );
    }
  });
}

)