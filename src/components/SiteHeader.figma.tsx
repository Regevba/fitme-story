// @ts-expect-error - figma module is provided at parse time by @figma/code-connect
import figma from '@figma/code-connect';
import { SiteHeader } from './SiteHeader';

figma.connect(
  SiteHeader,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=5-74',
  {
    example: () => <SiteHeader />,
  },
);
