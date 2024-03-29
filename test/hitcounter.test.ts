import { expect, haveResource } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import * as lambda from '@aws-cdk/aws-lambda';

import { HitCounter } from '../lib/hitCounter';

test('DynamoDB table created', () => {
    const stack = new cdk.Stack();

    // WHEN
    new HitCounter(stack, 'MyTestConstruct', {
        downstream: new lambda.Function(stack, 'TestFunction', {
            runtime: lambda.Runtime.NODEJS_12_X,
            handler: 'lambda.handler',
            code: lambda.Code.fromInline('test')
        })
    });

    // THEN
    expect(stack).to(haveResource('AWS::DynamoDB::Table', {
        SSESpecification: {
            SSEEnabled: true
        }
    }));
});

test('Lambda has environment variables', () => {
    const stack = new cdk.Stack();
    // WHEN
    new HitCounter(stack, 'MyTestConstruct', {
        downstream: new lambda.Function(stack, 'TestFunction', {
            runtime: lambda.Runtime.NODEJS_12_X,
            handler: 'lambda.handler',
            code: lambda.Code.fromInline('test')
        })
    });

    // THEN
    expect(stack).to(haveResource('AWS::Lambda::Function', {
        Environment: {
            Variables: {
                DOWNSTREAM_FUNCTION_NAME: {"Ref": "TestFunction22AD90FC"},
                HITS_TABLE_NAME: {"Ref": "MyTestConstructHits24A357F0"}
            }
        }
    }));
});
