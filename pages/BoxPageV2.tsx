/**
 * BoxPageV2 - Página para testing del nuevo spinner con Framer Motion
 * Usa BoxLayoutV2 con SpinnerV3
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import BoxLayoutV2 from '../layouts/BoxLayoutV2';

const BoxPageV2: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  return <BoxLayoutV2 slug={slug} />;
};

export default BoxPageV2;

