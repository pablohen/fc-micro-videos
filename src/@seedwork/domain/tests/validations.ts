import { expect } from "expect";
import { EntityValidationError } from "../errors/validation-error";
import { ClassValidatorFields } from "../validators/class-validator-fields";
import { FieldsErrors } from "../validators/validator-fields-interface";

type Expected =
  | {
      validator: ClassValidatorFields<any>;
      data: any;
    }
  | (() => any);

expect.extend({
  containsErrorMessages(expected: Expected, received: FieldsErrors) {
    if (typeof expected === "function") {
      try {
        expected();

        return isValid();
      } catch (err) {
        const error = err as EntityValidationError;
        const isMatch = expect
          .objectContaining(received)
          .asymmetricMatch(error.error);

        return assertContainsErrorMessages(error.error, received);
      }
    } else {
      const { validator, data } = expected;
      const validatorIsValid = validator.validate(data);

      if (validatorIsValid) {
        return isValid();
      }

      return assertContainsErrorMessages(validator.errors, received);
    }
  },
});

function isValid() {
  return {
    pass: true,
    message: () => "",
  };
}

function assertContainsErrorMessages(
  expected: FieldsErrors,
  received: FieldsErrors
) {
  const isMatch = expect.objectContaining(received).asymmetricMatch(expected);

  return isMatch
    ? {
        pass: true,
        message: () => "",
      }
    : {
        pass: false,
        message: () =>
          `The validation errors doesn't contain ${JSON.stringify(
            received
          )}. Current: ${JSON.stringify(expected)}`,
      };
}
