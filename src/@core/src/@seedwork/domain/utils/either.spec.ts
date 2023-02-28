import { Either } from "./either";

describe("Either Unit Tests", () => {
  test("should be an instance of array", () => {
    const either = new Either(1, 2);
    expect(either).toBeInstanceOf(Array);
  });

  test("constructor should be valid", () => {
    const either = new Either(1, 2);
    expect(either[0]).toBe(1);
    expect(either[1]).toBe(2);
  });

  test("should ok", () => {
    const either = Either.ok(1);
    expect(either[0]).toBe(1);
    expect(either[1]).toBeNull();
  });

  test("should fail", () => {
    const error = new Error("error message");
    const either = Either.fail(error);
    expect(either[0]).toBeNull();
    expect(either[1]).toBe(error);
  });

  test("should getOk", () => {
    const either = Either.ok(1);
    expect(either.getOk()).toBe(1);
  });

  test("should getFail", () => {
    const error = new Error("error message");
    const either = Either.fail(error);
    expect(either.getFail()).toBe(error);
  });

  test("should isOk", () => {
    const either = Either.ok(1);
    expect(either.isOk()).toBeTruthy();
    expect(either.isFail()).toBeFalsy();
  });

  test("should isFail", () => {
    const error = new Error("error message");
    const either = Either.fail(error);
    expect(either.isFail()).toBeTruthy();
    expect(either.isOk()).toBeFalsy();
  });
});
