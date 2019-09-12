import { helloWorld } from "./index";

test("returns message with name", () => {
  const message = helloWorld("Georgia");
  expect(message).toBe("Hello World, from Georgia!");
});
