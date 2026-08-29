const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provee la ruta a tu app Next.js para cargar next.config.js y archivos .env en tu entorno de prueba
  dir: './',
});

// Agrega cualquier configuración personalizada para pasar a Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

// createJestConfig se exporta de esta manera para asegurar que next/jest pueda cargar la configuración asíncrona de Next.js
module.exports = createJestConfig(customJestConfig);
