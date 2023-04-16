'use strict'

import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../libs/ddbDocClient.mjs";

const tableName = process.env.TABLE_NAME    

export const handler = async (event) => {
    console.log("Event===", JSON.stringify(event, null, 2));
    if (event.httpMethod  !== "GET") {
        throw new Error (`Expecting GET HTTP method but received ${event.httpMethod} method.`)
            }
    if (event.resource !== "/notes") {
        throw new Error (`Expecting resource path /notes but received ${event.resource} path.`) 
    }

    if (event.queryStringParameters===null || event.queryStringParameters.userId===null)  {
        throw new Error(`Expecting a userId, received ${event.queryStringParameters}`)   
    }



    const {userId} = event.queryStringParameters;
    console.log("userId===", userId)

     const params = {
        TableName:  tableName,
        KeyConditionExpression: "#ui = \:userId",
        ExpressionAttributeNames: {
            "#ui": "userId",
        },
        ExpressionAttributeValues:{
            "\:userId": userId
        }
     }

    
    
    let response;
    const command = new QueryCommand(params)
    try {
        const {Items} = await ddbDocClient.send(command)
        console.log(`Here are the notes for user ${userId}`, Items)
        response = {
            statusCode: 200,
            body: JSON.stringify(Items),
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