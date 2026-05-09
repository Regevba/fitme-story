// @ts-expect-error - figma module is provided at parse time by @figma/code-connect
import figma from '@figma/code-connect';
import { HonestDisclosure } from './HonestDisclosure';

figma.connect(
  HonestDisclosure,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=5-20',
  {
    props: {
      children: figma.string('Body'),
    },
    example: ({ children }) => <HonestDisclosure>{children}</HonestDisclosure>,
  },
);
