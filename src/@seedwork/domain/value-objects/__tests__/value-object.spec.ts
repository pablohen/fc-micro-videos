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
      { received: null, expected: "null" },
      { received: undefined, expected: "undefined" },
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
});
