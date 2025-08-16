// Export all components from subdirectories
export * from './ui/index.js';
export * from './layout/index.js';
export * from './features/index.js';

// Re-export commonly used components for convenience
export { Button, Card, Input, Modal, Badge, LoadingSpinner } from './ui/index.js';
export { Header, Footer, Layout, Breadcrumb } from './layout/index.js';
export { MovieCard, MovieGrid, SearchBar, MovieSection } from './features/index.js';
