'use strict';

import { handler } from '../../createUserNote.mjs';
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../../../../libs/ddbDocClient.mjs";
import { readFileSync } from "fs";

const event = readFileSync('./events/createUserNote.json');



describe('Tests index', function () {
    it('verifies successful response', async () => {
        const result = await lambdaHandler(event, context)

        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);
        expect(result.body).to.be.an('string');

        let response = JSON.parse(result.body);

        expect(response).to.be.an('object');
        expect(response.message).to.be.equal("hello world");
    });
});
