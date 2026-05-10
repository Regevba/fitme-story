// @ts-expect-error - figma module is provided at parse time by @figma/code-connect
import figma from '@figma/code-connect';
import { Disclosure } from './Disclosure';

figma.connect(
  Disclosure,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=10-13',
  {
    example: () => (
      <Disclosure label="Section title" summary="Optional summary line">
        Body content goes here.
      </Disclosure>
    ),
  },
);
