import { describe, it, expect } from 'vitest';

function hello(name: string) {
  return `Hello, ${name}!`;
}

describe('hello', () => {
  it('greets the user by name', () => {
    expect(hello('Airwave')).toBe('Hello, Airwave!');
  });
});
