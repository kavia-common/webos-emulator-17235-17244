import { render } from '@testing-library/react';
import { EmulatorApp } from './macos/EmulatorApp';
import { EmulatorProvider } from './macos/context/EmulatorContext';

test('renders emulator without crashing', () => {
  render(
    <EmulatorProvider>
      <EmulatorApp />
    </EmulatorProvider>
  );
});
