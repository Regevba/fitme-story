// @ts-expect-error - figma module is provided at parse time by @figma/code-connect
import figma from '@figma/code-connect';
import { Callout } from './Callout';

figma.connect(
  Callout,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=19-7',
  {
    example: () => <Callout variant="info" title="Heads up">Body content here</Callout>,
  },
);

figma.connect(
  Callout,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=19-11',
  {
    example: () => <Callout variant="warn" title="Caution">Watch out</Callout>,
  },
);

figma.connect(
  Callout,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=19-15',
  {
    example: () => <Callout variant="success" title="Done">Shipped</Callout>,
  },
);

figma.connect(
  Callout,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=19-19',
  {
    example: () => <Callout variant="danger" title="Important">Critical</Callout>,
  },
);
