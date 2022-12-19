import { deepFreeze } from "./object";

describe("Object Unit Tests", () => {
  test("should not freeze a scalar value", () => {
    let boolean = deepFreeze(true);
    expect(typeof boolean).toBe("boolean");

    boolean = deepFreeze(false);
    expect(typeof boolean).toBe("boolean");

    const number = deepFreeze(4);
    expect(typeof number).toBe("number");
  });

  test("should be an immutable object", () => {
    const obj = deepFreeze({
      prop1: "value 1",
      deep: { prop2: "value 2", prop3: new Date() },
    });

    expect(() => ((obj as any).prop1 = "aaaaaa")).toThrow(
      "Cannot assign to read only property 'prop1' of object '#<Object>'"
    );
    expect(() => ((obj as any).deep.prop2 = "aaaaaa")).toThrow(
      "Cannot assign to read only property 'prop2' of object '#<Object>'"
    );
    expect(obj.deep.prop3).toBeInstanceOf(Date);
  });
});
