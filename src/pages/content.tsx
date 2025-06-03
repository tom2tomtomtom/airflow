import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/assets',
      permanent: false,
    },
  };
};

const ContentPage = () => {
  return null;
};

export default ContentPage;