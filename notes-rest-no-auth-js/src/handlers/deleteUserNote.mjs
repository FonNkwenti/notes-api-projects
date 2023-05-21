'use strict'

import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../libs/ddbDocClient.mjs";

const tableName = process.env.TABLE_NAME;

export const handler = async (event)=>{
    
    console.log("Event===", JSON.stringify(event, null, 2));
    if (event.httpMethod  !== "DELETE") {
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
    console.log(`userId===${userId} and noteId===${noteId}`)

    
    const params = {
        TableName: tableName,
        Key: {
            userId,
            noteId,
        },
  
        ConditionExpression: "attribute_exists(noteId) AND contains(userId, \:userId)",
        
        ReturnValues: "ALL_OLD",
        ExpressionAttributeValues: {
            "\:userId": userId
        }
    }

    
    const command = new DeleteCommand(params);
    let response
    try {
        const result = await  ddbDocClient.send(command);
        // console.log(`Succeeded in deleting the note with id ${noteId} for user with id ${userId}`)
        console.log(result.$metadata.httpStatusCode === 200 ? `Succeeded in deleting the note with id ${noteId} for user with id ${userId}`: `Delete failed` )
        response = {
            statusCode: 200,
            body: JSON.stringify(result),
        }
    } catch (err) {
        console.log("Error", JSON.stringify(err, null, 2))
            response = {
                statusCode: err.$metadata?.httpStatusCode || 500,
                body: JSON.stringify({err})

            }
        }
    console.log("response===", response)
    return response
        
}