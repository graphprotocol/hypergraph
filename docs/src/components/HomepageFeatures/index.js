import Heading from '@theme/Heading';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Secure by Default',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Private content is end-to-end encrypted by default, and public content is stored in the Knowledge Graph backed
        by IPFS and a blockchain.
      </>
    ),
  },
  {
    title: 'Easy to Use',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        When building with Hypergraph, developers only need to write client-side software - the framework takes care of
        the infrastructure, including privacy (E2EE) by default and storing public content in an interoperable,
        interconnected Knowledge Graph.
      </>
    ),
  },

  {
    title: 'Collaboration built-in',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>Hypergraph spaces can be shared with other users, and can be used to collaborate on content in real-time.</>
    ),
  },
];

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
