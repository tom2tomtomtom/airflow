import React from 'react';
import { Skeleton, Box, Card, CardContent } from '@mui/material';

interface LoadingSkeletonProps {
  variant?: 'card' | 'list' | 'table' | 'text';
  count?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  variant = 'card', 
  count = 1 
}) => {
  const renderCardSkeleton = () => (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="60%" height={32} />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="80%" />
        <Box mt={2}>
          <Skeleton variant="rectangular" height={40} />
        </Box>
      </CardContent>
    </Card>
  );

  const renderListSkeleton = () => (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <Skeleton variant="circular" width={40} height={40} />
        <Box ml={2} flex={1}>
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="60%" />
        </Box>
      </Box>
    </Box>
  );

  const renderTableSkeleton = () => (
    <Box>
      <Skeleton variant="rectangular" height={56} />
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={52} sx={{ mt: 0.5 }} />
      ))}
    </Box>
  );

  const renderTextSkeleton = () => (
    <Box>
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="70%" />
    </Box>
  );

  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return renderCardSkeleton();
      case 'list':
        return renderListSkeleton();
      case 'table':
        return renderTableSkeleton();
      case 'text':
        return renderTextSkeleton();
      default:
        return renderCardSkeleton();
    }
  };

  return (
    <>
      {[...Array(count)].map((_, index) => (
        <Box key={index} mb={variant === 'card' ? 3 : 2}>
          {renderSkeleton()}
        </Box>
      ))}
    </>
  );
};

export default LoadingSkeleton;
