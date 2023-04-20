'use strict'

import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../libs/ddbDocClient.mjs";

const tableName = process.env.TABLE_NAME;

export const handler = async (event)=>{
    
    console.log("Event===", JSON.stringify(event, null, 2));
    if (event.httpMethod  !== "GET") {
        throw new Error (`Expecting GET HTTP method but received ${event.httpMethod} method.`)
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
        }
    }
    const command = new GetCommand(params);
    let response
    try {
        const {Item} = await  ddbDocClient.send(command);
        if (!Item) {
            throw new Error("The Note is either empty or doesn't exist")
        }
        console.log(Item ? `Succeeded in getting  the note with id ${noteId} for user with id ${userId}
        ${Item}` : `Note with id ${noteId} does not exist`)
        response = {
            statusCode: 200,
            body: JSON.stringify(Item),
        }
    } catch (err) {
        console.log("Error", err)
            response = {
                statusCode: err.statusCode || 500,
                body: JSON.stringify({err: err.Error})
            }
        }
    console.log("response===", response)
    return response
        
    }