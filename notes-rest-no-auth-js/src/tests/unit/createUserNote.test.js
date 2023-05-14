const { handler } = require('../../handlers/createUserNote.mjs');
const { serverless } = require('sls-jest');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { ddbDocClient } = require('../libs/ddbDocClient.mjs');

describe('Your Lambda Function', () => {
  beforeAll(async () => {
    await serverless({
      config: './serverless.yml',
    });
  });

  afterAll(async () => {
    await serverless();
  });

  it('should create a note in DynamoDB', async () => {
    // Mock the `send` method of the ddbDocClient to return a specific response
    const mockSend = jest.fn().mockResolvedValue({});
    ddbDocClient.send = mockSend;

    const event = {
      httpMethod: 'POST',
      queryStringParameters: { userId: '123' },
      body: JSON.stringify({ title: 'Test Note', content: 'Some content' }),
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(201);
    expect(response.body).toBeDefined();

    const responseBody = JSON.parse(response.body);
    expect(responseBody.userId).toEqual('123');
    expect(responseBody.title).toEqual('Test Note');
    // ... other assertions

    // Verify the `send` method was called with the correct command
    expect(mockSend).toHaveBeenCalledWith(expect.any(PutCommand));
    const command = mockSend.mock.calls[0][0];
    expect(command.input.TableName).toEqual(process.env.TABLE_NAME);
    // ... other assertions on the command
  });

  // Add more test cases for different scenarios
});
