import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as StarterKit from '../lib/starter-kit-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new StarterKit.StarterKitStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
