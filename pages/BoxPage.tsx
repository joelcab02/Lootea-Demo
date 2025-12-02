/**
 * BoxPage - Página para jugar una caja específica
 * Usa BoxLayout con el slug de la URL
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import BoxLayout from '../layouts/BoxLayout';

const BoxPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  return <BoxLayout slug={slug} />;
};

export default BoxPage;
