export default class UniqueConstraintError extends Error {
  constructor(path: string) {
    super(`Unique constraint field for ${path} failed!`);
  }
}
