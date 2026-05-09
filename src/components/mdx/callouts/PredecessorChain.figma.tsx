// @ts-expect-error - figma module is provided at parse time by @figma/code-connect
import figma from '@figma/code-connect';
import { PredecessorChain } from './PredecessorChain';

figma.connect(
  PredecessorChain,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=5-38',
  {
    example: () => (
      <PredecessorChain
        chain={[
          { version: 'v7.5', slug: 'example-v7-5', focus: 'predecessor focus' },
          { version: 'v7.6', slug: 'example-v7-6', focus: 'next focus' },
        ]}
      />
    ),
  },
);
