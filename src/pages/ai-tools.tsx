import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/strategic-content',
      permanent: false,
    },
  };
};

const AIToolsPage = () => {
  return null;
};

export default AIToolsPage;