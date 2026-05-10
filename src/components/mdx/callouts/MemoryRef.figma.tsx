// @ts-expect-error - figma module is provided at parse time by @figma/code-connect
import figma from '@figma/code-connect';
import { MemoryRef } from './MemoryRef';

figma.connect(
  MemoryRef,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=5-32',
  {
    example: () => (
      <MemoryRef
        slug="example-case-study"
        title="Example case study"
        note="One-line note about the cross-reference"
      />
    ),
  },
);
