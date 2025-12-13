// This allows TypeScript to understand .json imports
declare module '*.json' {
  const value: any;
  export default value;
}
