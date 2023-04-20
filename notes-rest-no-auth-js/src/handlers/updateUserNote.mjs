'use strict'

import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../libs/ddbDocClient.mjs";

const tableName = process.env.TABLE_NAME;
const now = new Date().toISOString()

export const handler = async (event)=>{
    
    console.log("Event===", JSON.stringify(event, null, 2));
    if (event.httpMethod  !== "PATCH") {
        throw new Error (`Expecting DELETE HTTP method but received ${event.httpMethod} method.`)
            }
    if (!event.pathParameters) { 
        throw new Error ("Missing path parameter")
    }
 
    if (event.resource !== "/notes/{noteId}") {
        throw new Error(`Expecting /notes/{noteId}, received ${event.resource}`)   
    }
    if (event.queryStringParameters===null || event.queryStringParameters.userId===null)  {
        throw new Error(`Expecting a userId, received ${event.queryStringParameters}`)   
    }
    console.log("the path parameters are ===", event.pathParameters)
    console.log("the query strings are  ===", JSON.stringify(event.queryStringParameters, null, 2))

    const userId = event.queryStringParameters.userId
    const {noteId} = event.pathParameters;
    const body = JSON.parse(event.body)
    body.updatedAt = now

    console.log(
        `userId===${userId} 
        noteId===${noteId}
        body ===${body}
        `)
    
        const bodyKeys = Object.keys(body)
        console.log("the bodyKeys===", bodyKeys)

    const UpdateExpression = []
    const ExpressionAttributeNames = {}
    const ExpressionAttributeValues = {}
    
    for (const [key, value] of Object.entries(body)) {
        UpdateExpression.push(`#${key} = \:${key}`);
        ExpressionAttributeNames[`#${key}`] = key;
        ExpressionAttributeValues[`#${key}`] = value;
        
    }

    console.log("UpdateExpression===", UpdateExpression)
    console.log("ExpressionAttributeNames===", ExpressionAttributeNames)
    console.log("ExpressionAttributeValues===", ExpressionAttributeValues)

    // const params = {
    //     TableName: tableName,
    //     Key: {
    //         userId,
    //         noteId,
    //     },
  
    //     UpdateExpression: `SET ${UpdateExpression.join(", ")}`,
    //     ExpressionAttributeNames,
    //     ExpressionAttributeValues,

    // }

    const params = {
        TableName: tableName,
        Key: {
            userId,
            noteId,
        },
  
        UpdateExpression: `SET ${bodyKeys.map((_, index) => `#key${index} = \:value${index}`).join(", ")}`,

        ExpressionAttributeNames: bodyKeys.reduce((acc, key, index)=>({
            ...acc,
            [`#key${index}`]: key,
        }), {}),
        ExpressionAttributeValues: bodyKeys.reduce(
            (acc, key, index) => ({
                ...acc,
                [`:value${index}`]: body[key]
            }), {}
        )

    }

    
    const command = new UpdateCommand(params);
    let response
    try {
        const result = await  ddbDocClient.send(command);
        console.log('params===', params)
        console.log(result.$metadata.httpStatusCode === 200 ? `Succeeded in updating the note with id ${noteId} for user with id ${userId}`: `Update failed` )
        response = {
            statusCode: 200,
            body: JSON.stringify(result),
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