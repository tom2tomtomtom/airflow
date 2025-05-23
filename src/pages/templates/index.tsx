import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function TemplatesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/templates-new');
  }, [router]);

  return null;
}
