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
    if (!event.pathParameters.userId || !event.pathParameters.noteId) {
        throw new Error ("Missing userId or noteId path parameter")
    } 
    if (event.resource !== "/notes/{userId}/{noteId}") {
        throw new Error(`Expecting /notes/{userId}/{noteId}, received ${event.resource}`)
        
    }
    const userId = event.pathParameters.userId;
    const noteId = event.pathParameters.noteId;
    console.log("the path parameters are ===", event.pathParameters)
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
        console.log(`Succeeded in getting  the note with id ${noteId} for user with id ${userId}`, Item)
        response = {
            statusCode: 200,
            body: JSON.stringify(Item),
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