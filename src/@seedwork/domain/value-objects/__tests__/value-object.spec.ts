import { deepFreeze } from "../../../../@seedwork/domain/utils/object";
import { ValueObject } from "../value-object";

class StubValueObject extends ValueObject {}

describe("ValueObject Unit Tests", () => {
  test("should set value", () => {
    let vo = new StubValueObject("string value");
    expect(vo.value).toBe("string value");

    vo = new StubValueObject({ prop: "prop test" });
    expect(vo.value).toStrictEqual({ prop: "prop test" });

    console.log(`${vo}`);
  });

  test("should convert to string", () => {
    const date = new Date();
    const arrange = [
      { received: "", expected: "" },
      { received: "fake test", expected: "fake test" },
      { received: 0, expected: "0" },
      { received: 1, expected: "1" },
      { received: -1, expected: "-1" },
      { received: 5, expected: "5" },
      { received: true, expected: "true" },
      { received: false, expected: "false" },
      { received: date, expected: date.toString() },
      {
        received: { prop: "prop value" },
        expected: JSON.stringify({ prop: "prop value" }),
      },
    ];

    arrange.forEach((item) => {
      let vo = new StubValueObject(item.received);
      expect(vo + "").toBe(item.expected);
    });
  });

  test("should be immutable", () => {
    const obj = deepFreeze({
      prop1: "value 1",
      deep: { prop2: "value 2", prop3: new Date() },
    });

    const vo = new StubValueObject(obj);

    expect(() => ((vo as any).value.prop1 = "test 1")).toThrow(
      "Cannot assign to read only property 'prop1' of object '#<Object>'"
    );
    expect(() => ((vo as any).value.deep.prop2 = "test 2")).toThrow(
      "Cannot assign to read only property 'prop2' of object '#<Object>'"
    );
    expect(vo.value.deep.prop3).toBeInstanceOf(Date);
  });
});
