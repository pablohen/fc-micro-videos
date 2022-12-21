import { v4 as uuidV4, validate as uuidValidate } from "uuid";
import { InvalidUuidError } from "../../errors/invalid-uuid-error";

import { UniqueEntityId } from "../unique-entity-id.vo";

describe("UniqueEntityId Unit Tests", () => {
  const validateSpy = jest.spyOn(UniqueEntityId.prototype as any, "validate");

  // beforeEach(() => {
  //   validateSpy.mockClear();
  // });

  test("should throw an error when uuid is invalid", () => {
    expect(() => new UniqueEntityId("fake id")).toThrow(new InvalidUuidError());
    expect(validateSpy).toHaveBeenCalled();
  });

  test("should accept a valid uuid in constructor", () => {
    const id = uuidV4();
    const vo = new UniqueEntityId(id);

    expect(vo.value).toBe(id);
    expect(validateSpy).toHaveBeenCalled();
  });

  test("should generate a valid uuid", () => {
    const vo = new UniqueEntityId();

    expect(uuidValidate(vo.value)).toBeTruthy();
    expect(validateSpy).toHaveBeenCalled();
  });
});
