// @ts-expect-error - figma module is provided at parse time by @figma/code-connect
import figma from '@figma/code-connect';
import { SiteFooter } from './SiteFooter';

figma.connect(
  SiteFooter,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=5-89',
  {
    example: () => <SiteFooter />,
  },
);
