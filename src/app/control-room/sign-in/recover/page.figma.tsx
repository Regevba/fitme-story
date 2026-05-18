// @ts-expect-error - figma module is provided at parse time by @figma/code-connect
import figma from '@figma/code-connect';
import RecoverPage from './page';

figma.connect(
  RecoverPage,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=31-106',
  {
    example: () => <RecoverPage />,
  },
);
