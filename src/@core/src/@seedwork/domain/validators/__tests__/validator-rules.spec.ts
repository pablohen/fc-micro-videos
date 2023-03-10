import { ValidationError } from "../../errors/validation-error";
import { ValidatorRules } from "../validator-rules";

interface ArrangeTest {
  value: any;
  property: string;
}

type Arrange = ArrangeTest[];

type ExpectedRule = {
  value: any;
  property: string;
  rule: keyof ValidatorRules;
  error: ValidationError;
  params?: any[];
};

function assertIsInvalid(expected: ExpectedRule) {
  expect(() => {
    runRule(expected);
  }).toThrow(expected.error);
}

function assertIsValid(expected: ExpectedRule) {
  expect(() => {
    runRule(expected);
  }).not.toThrow(expected.error);
}

function runRule({
  value,
  property,
  rule,
  params = [],
}: Omit<ExpectedRule, "error">) {
  const validator = ValidatorRules.values(value, property);
  const method = validator[rule] as any;
  method.apply(validator, params);
}

describe("ValidatorRules Unit Test", () => {
  test("should have correct values", () => {
    const validator = ValidatorRules.values("a value", "a property");
    expect(validator).toBeInstanceOf(ValidatorRules);
    expect(validator["value"]).toBe("a value");
  });

  describe("should be required", () => {
    const errorMessage = "The field is required";

    let arrange: Arrange = [
      { value: null, property: "field" },
      {
        value: undefined,
        property: "field",
      },
      { value: "", property: "field" },
    ];

    test.each(arrange)("validate %j", (item) => {
      assertIsInvalid({
        value: item.value,
        property: item.property,
        rule: "required",
        error: new ValidationError(errorMessage),
      });
    });

    arrange = [
      { value: "test", property: "field" },
      {
        value: 5,
        property: "field",
      },
      { value: 0, property: "field" },
      { value: false, property: "field" },
    ];

    test.each(arrange)("validate %j", (item) => {
      assertIsValid({
        value: item.value,
        property: item.property,
        rule: "required",
        error: new ValidationError(errorMessage),
      });
    });
  });

  describe("should be string", () => {
    const errorMessage = "The field must be a string";

    let arrange: Arrange = [
      { value: 5, property: "field" },
      {
        value: {},
        property: "field",
      },
      { value: false, property: "field" },
    ];

    arrange.forEach((item) => {
      assertIsInvalid({
        value: item.value,
        property: item.property,
        rule: "string",
        error: new ValidationError(errorMessage),
      });
    });

    arrange = [
      { value: null, property: "field" },
      { value: undefined, property: "field" },
      { value: "test", property: "field" },
    ];

    test.each(arrange)("validate %j", (item) => {
      assertIsValid({
        value: item.value,
        property: item.property,
        rule: "string",
        error: new ValidationError(errorMessage),
      });
    });
  });

  describe("should not exceed max length", () => {
    const errorMessage =
      "The field length must be less or equal to 4 characters";

    let arrange: Arrange = [{ value: "12345", property: "field" }];

    test.each(arrange)("validate %j", (item) => {
      assertIsInvalid({
        value: item.value,
        property: item.property,
        rule: "maxLength",
        error: new ValidationError(errorMessage),
        params: [4],
      });
    });

    arrange = [
      { value: null, property: "field" },
      { value: undefined, property: "field" },
      { value: "1234", property: "field" },
    ];

    test.each(arrange)("validate %j", (item) => {
      assertIsValid({
        value: item.value,
        property: item.property,
        rule: "maxLength",
        error: new ValidationError(errorMessage),
        params: [4],
      });
    });
  });

  describe("should be boolean", () => {
    const errorMessage = "The field must be a boolean";

    let arrange: Arrange = [
      { value: 5, property: "field" },
      {
        value: {},
        property: "field",
      },
      { value: "true", property: "field" },
      { value: "false", property: "field" },
    ];

    test.each(arrange)("validate %j", (item) => {
      assertIsInvalid({
        value: item.value,
        property: item.property,
        rule: "boolean",
        error: new ValidationError(errorMessage),
      });
    });

    arrange = [
      { value: null, property: "field" },
      { value: undefined, property: "field" },
      { value: true, property: "field" },
      { value: false, property: "field" },
    ];

    test.each(arrange)("validate %j", (item) => {
      assertIsValid({
        value: item.value,
        property: item.property,
        rule: "string",
        error: new ValidationError(errorMessage),
      });
    });
  });

  test("should throw a validation error combining validators", () => {
    let validator = ValidatorRules.values(null, "field");

    expect(() => validator.required().string()).toThrow(
      new ValidationError("The field is required")
    );

    validator = ValidatorRules.values(5, "field");
    expect(() => validator.required().string()).toThrow(
      new ValidationError("The field must be a string")
    );

    validator = ValidatorRules.values("666666", "field");
    expect(() => validator.required().string().maxLength(4)).toThrow(
      new ValidationError(
        "The field length must be less or equal to 4 characters"
      )
    );

    validator = ValidatorRules.values(null, "field");
    expect(() => validator.required().boolean()).toThrow(
      new ValidationError("The field is required")
    );

    validator = ValidatorRules.values(5, "field");
    expect(() => validator.required().boolean()).toThrow(
      new ValidationError("The field must be a boolean")
    );
  });

  test("should be valid when combining validators", () => {
    expect.assertions(0);
    ValidatorRules.values("test", "field").required().string();
    ValidatorRules.values("test123", "field").required().string().maxLength(8);

    ValidatorRules.values(true, "field").required().boolean();
    ValidatorRules.values(false, "field").required().boolean();
  });
});
