import React from 'react';
import { NextPageContext } from 'next';
import NextErrorComponent from 'next/error';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';

interface ErrorPageProps {
  statusCode: number;
  hasGetInitialPropsRun: boolean;
  err?: Error;
}

const ErrorPage = ({ statusCode, hasGetInitialPropsRun, err }: ErrorPageProps) => {
  if (!hasGetInitialPropsRun && err) {
    // getInitialProps is not called in case of
    // https://github.com/vercel/next.js/issues/8592. As a workaround, we pass
    // err via _app.js so it can be captured
    Sentry.captureException(err);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900">{statusCode}</h1>
          <p className="mt-4 text-xl text-gray-600">
            {statusCode === 404
              ? 'This page could not be found.'
              : 'An error occurred on the server.'}
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Go back home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

ErrorPage.getInitialProps = async (context: NextPageContext) => {
  const errorInitialProps = await NextErrorComponent.getInitialProps(context);
  
  const { res, err, asPath } = context;
  
  // Workaround for https://github.com/vercel/next.js/issues/8592, mark when
  // getInitialProps has run
  const hasGetInitialPropsRun = true;
  
  if (res?.statusCode === 404) {
    return { statusCode: 404, hasGetInitialPropsRun };
  }
  
  if (err) {
    Sentry.captureException(err);
    await Sentry.flush(2000);
    return { ...errorInitialProps, hasGetInitialPropsRun };
  }
  
  // If this point is reached, getInitialProps was called without any
  // information about what the error might be. This is unexpected and may
  // indicate a bug introduced in Next.js, so record it in Sentry
  Sentry.captureException(
    new Error(`_error.js getInitialProps missing data at path: ${asPath}`)
  );
  await Sentry.flush(2000);
  
  return { ...errorInitialProps, hasGetInitialPropsRun };
};

export default ErrorPage;
