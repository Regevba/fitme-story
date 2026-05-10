// @ts-expect-error - figma module is provided at parse time by @figma/code-connect
import figma from '@figma/code-connect';
import { Stat } from './Stat';

figma.connect(
  Stat,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=21-7',
  {
    example: () => <Stat value="100%" label="Public parity" sublabel="17 / 17" size="sm" accent />,
  },
);

figma.connect(
  Stat,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=21-11',
  {
    example: () => <Stat value="3.5×" label="Speedup" size="md" accent />,
  },
);

figma.connect(
  Stat,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=21-15',
  {
    example: () => <Stat value="169" label="Min" size="lg" accent />,
  },
);
