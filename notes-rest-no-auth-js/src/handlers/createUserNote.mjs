/**
 * The createUserNote function.
 * What does this function do? The createUserNote function expects API Gateway Proxy event with an HTTP POST method, are resouce path of /notes, and a JSON body. It also expects to receive a 'userId' parameter as a query string parameter. The JSON body should contain the following fields: 'title', 'content', and 'label'
 * When the function gets the request from the API Gateway proxy event, it will generate a UUID for the noteId field and set the createAt and updatedAt fields 
 * Then function will use the PutCommand from the ddDocClient object to create the item in DynamoDB. A successful operation should return a 201 HTTP status code and a response body.
 * A failed operation should return a 500 status code
 * 
 */
'use strict'

// /**
//  * @param {import('aws-lambda).APIGatewayEvent} event
//  * @returns {Promise<import('aws-lambda').APIGatewayProxyResult>}
//  */

import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../libs/ddbDocClient.mjs";
import { randomUUID } from "crypto";

const tableName = process.env.TABLE_NAME    

export const handler = async (event) => {
    console.log("Event===", JSON.stringify(event, null, 2))
    if (event.httpMethod !=="POST") {
        throw new Error(`Expecting POST method, received ${event.httpMethod}`);
    }
    if (event.queryStringParameters===null || event.queryStringParameters.userId===null) {
        throw new Error(`Expecting a userId, received ${event.queryStringParameters}`)   
    }
    console.log("the path parameters are ===", event.pathParameters)
    console.log("the query strings are  ===", event.queryStringParameters)
    
    
    const userId = event.queryStringParameters.userId
    const parsedBody = JSON.parse(event.body)
    console.info("parsedBody==", parsedBody)
    const {title, content, label = "none"} = parsedBody
    // const { userId, title, content, label = "none"} = parsedBody
    const now = new Date().toISOString()
    const noteId = randomUUID()
    
    console.log(`userId===${userId} and noteId===${noteId}`)

    const params = {
        TableName:  tableName,
        Item: {
            userId,
            noteId:  noteId,
            title,
            content,
            label,
            createdAt: now,
            updatedAt: now,
    }
    
}
console.log("params===", params)
    let response;
    const command = new PutCommand(params)
    try {
        const data = await ddbDocClient.send(command)
        console.log("Success, note created", data)
        response = {
            statusCode: 201,
            body: JSON.stringify(params.Item),
        }

            
        } catch (err) {
            console.log("Error", err)
            response = {
                statusCode: err.statusCode || 500,
                body: JSON.stringify({err})
            }
        }
    console.log("response===", response)
    return response
}