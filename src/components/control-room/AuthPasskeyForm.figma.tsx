// @ts-expect-error - figma module is provided at parse time by @figma/code-connect
import figma from '@figma/code-connect';
import AuthPasskeyForm from './AuthPasskeyForm';

figma.connect(
  AuthPasskeyForm,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=30-61',
  {
    props: {
      mode: figma.enum('mode', { authenticate: 'authenticate', register: 'register' }),
    },
    example: ({ mode }) => <AuthPasskeyForm mode={mode} />,
  },
);
