// @ts-expect-error - figma module is provided at parse time by @figma/code-connect
import figma from '@figma/code-connect';
import SignInPage from './page';

figma.connect(
  SignInPage,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=31-3',
  {
    example: () => <SignInPage />,
  },
);
