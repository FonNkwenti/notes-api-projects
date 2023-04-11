import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient({region: "us-west-1"});
const ddbDocClient = DynamoDBDocumentClient.from(client);
export { ddbDocClient };
