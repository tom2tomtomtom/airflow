import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/assets',
      permanent: false,
    },
  };
};

const ContentPage = (): JSX.Element => {
  return null;
};

export default ContentPage;
