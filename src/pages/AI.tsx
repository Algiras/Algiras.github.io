import { Container } from '@mantine/core';
import React from 'react';
import VoiceAssistant from '../components/ai/VoiceAssistant';

const AIPage: React.FC = () => {
  return (
    <Container size="lg" py="xl">
      <VoiceAssistant />
    </Container>
  );
};

export default AIPage;


