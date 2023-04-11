'use strict'

import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../libs/ddbDocClient.mjs";
import { randomUUID } from "crypto";

const tableName = process.env.TABLE_NAME    

export const handler = async (event) => {
    console.log("Event===", JSON.stringify(event, null, 2))
    if (event.httpMethod !=="POST") {
        throw new Error(`Expecting POST method, received ${event.httpMethod}`);
    }
    

    const parsedBody = JSON.parse(event.body)
    console.info("parsedBody==", parsedBody)
    const { userId, title, content, label = "none"} = parsedBody
    const now = new Date().toISOString()
    const noteId = randomUUID()

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