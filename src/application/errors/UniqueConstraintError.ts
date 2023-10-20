export default class UniqueConstraintError extends Error {
  constructor(public path: string) {
    super(`Unique constraint field for ${path} failed!`);
  }
}
