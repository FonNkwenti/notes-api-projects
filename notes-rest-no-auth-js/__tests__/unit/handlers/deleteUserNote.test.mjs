'use strict'
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

import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../../../src/libs/ddbDocClient.mjs";
import { mockClient } from "aws-sdk-client-mock";
import { handler } from "../../../src/handlers/deleteUserNote.mjs";

// const tableName = process.env.TABLE_NAME;

describe('Test deleteUserNote handler', () => {
    // create a mock client
    const ddbMockClient = mockClient(ddbDocClient)

    // set up the expected response from the mock client

    // reset the history and behavior of the moack after each test so they don't interfere with each other  
    beforeEach(() => {
        ddbMockClient.reset()
    })

    // invoke and test the deleteUserNote handler
    it('should delete a user note from DynamoDB', async () =>{
        const mockEvent = {
            httpMethod: 'DELETE',
            queryStringParameters: {userId: 'abc123'},
            pathParameters: {noteId: '123'},
            resource: '/notes/{noteId}'
        }

        const deleteCommandResponse = {
            $metadata:{
                httpStatusCode: 200
            }

        }

        // mock the response from the DeleteCommand to the expected deleteCommandResponse
        ddbMockClient.on(DeleteCommand).resolves(deleteCommandResponse)

        // invoke the handler function  with the mockEvent
        const response = await handler(mockEvent)
        console.log("mockResponse===", response)

        // Assert that the response matches the expected output
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual(deleteCommandResponse)
    })

    // test handling missing pathParameters
    it('should handle missing pathParameters', async () => {
        const mockEvent = {
            httpMethod: 'DELETE',
            queryStringParameters: {userId: 'abc123'},
            pathParameters: null,
            resource: '/notes/{noteId}'
        }

        try {
            await handler(mockEvent)
        
        } catch (error) {
            expect(error.message).toBe('Missing path parameter')
        }
            
        
    })

    // test handling missing userId
    it('should handle missing userId', async () => {
        const mockEvent = {
            httpMethod: 'DELETE',
            queryStringParameters: null,
            pathParameters: {noteId: '123'},
            resource: '/notes/{noteId}'
        }

        try {
            await handler(mockEvent)
        
        } catch (error) {
            console.log("error===", error)
            expect(error.message).toBe('Expecting a userId, received null')
        }
    })
    
    // test handling non-existent note
   
    it('should handle non-existent note', async () => {
        const mockEvent = {
            httpMethod: 'DELETE',
            queryStringParameters: {userId: 'abc123'},
            pathParameters: {noteId: 'nonExistentId'},
            resource: '/notes/{noteId}'
        }

        const deleteCommandResponse = {
            err: {
                name: "ConditionalCheckFailedException",
                $metadata:{
                    httpStatusCode: 400
                }
            }
    
            }

        

        // mock the response from the DeleteCommand to the expected deleteCommandResponse
        // ddbMockClient.on(DeleteCommand).resolves(deleteCommandResponse)
        ddbMockClient.on(DeleteCommand).rejects(deleteCommandResponse.err)
        
                // invoke the handler function  with the mockEvent
        const response = await handler(mockEvent)
        console.log("mockResponse===", response)

        // Assert that the response matches the expected output
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body)).toEqual(deleteCommandResponse)
    
    }) 
      
})