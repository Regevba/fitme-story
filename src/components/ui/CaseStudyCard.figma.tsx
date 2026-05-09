// @ts-expect-error - figma module is provided at parse time by @figma/code-connect
import figma from '@figma/code-connect';
import { CaseStudyCard } from './CaseStudyCard';

figma.connect(
  CaseStudyCard,
  'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=5-52',
  {
    props: {
      title: figma.string('Title'),
      tldr: figma.string('TLDR'),
      tagLabel: figma.string('Tag'),
    },
    example: ({ title, tldr, tagLabel }) => (
      <CaseStudyCard
        href="/case-studies/example"
        title={title}
        tldr={tldr}
        tagLabel={tagLabel}
        tagVariant="standard"
      />
    ),
  },
);
