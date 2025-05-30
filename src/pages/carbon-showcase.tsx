import React from 'react';
import Head from 'next/head';
import CarbonDesignShowcase from '@/components/CarbonDesignShowcase';

const CarbonShowcasePage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Carbon Black Design System - AIrWAVE</title>
        <meta name="description" content="Showcase of the Carbon Black design system for AIrWAVE" />
      </Head>
      <CarbonDesignShowcase />
    </>
  );
};

export default CarbonShowcasePage;