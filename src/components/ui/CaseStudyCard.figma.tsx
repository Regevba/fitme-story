// @ts-expect-error - figma module is provided at parse time by @figma/code-connect
import figma from '@figma/code-connect';
import { CaseStudyCard } from './CaseStudyCard';

figma.connect(
  CaseStudyCard,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=5-52',
  {
    example: () => (
      <CaseStudyCard
        href="/case-studies/example"
        title="Example Case Study"
        tldr="One-line summary of what this case study covers."
        tagLabel="Standard"
        tagVariant="standard"
      />
    ),
  },
);
