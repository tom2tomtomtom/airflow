// Simple Jest test - no imports needed for basic Jest functions

function hello(name: string) {
  return `Hello, ${name}!`;
}

describe('hello', () => {
  it('greets the user by name', () => {
    expect(hello('Airwave')).toBe('Hello, Airwave!');
  });
});
